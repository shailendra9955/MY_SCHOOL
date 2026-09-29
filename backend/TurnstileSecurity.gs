/*
 * Modern Convent School
 * Google Apps Script security helpers for login and protected API calls.
 *
 * IMPORTANT:
 * This file is an integration patch for the existing Apps Script API.
 * Do NOT replace your complete working API with this file.
 *
 * Store the following values in:
 * Apps Script → Project Settings → Script Properties
 *
 * TURNSTILE_SECRET_KEY
 * TURNSTILE_ALLOWED_HOSTNAME
 *
 * Example:
 * TURNSTILE_ALLOWED_HOSTNAME = your-domain.com
 *
 * The secret key must NEVER be placed in the website JavaScript.
 */

const SECURITY_CONFIG = Object.freeze({
    TURNSTILE_VERIFY_URL:
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",

    TURNSTILE_SECRET_PROPERTY:
        "TURNSTILE_SECRET_KEY",

    TURNSTILE_HOSTNAME_PROPERTY:
        "TURNSTILE_ALLOWED_HOSTNAME",

    TURNSTILE_ACTION:
        "login",

    LOGIN_LIMIT:
        5,

    LOGIN_WINDOW_SECONDS:
        15 * 60,

    SESSION_TTL_SECONDS:
        6 * 60 * 60
});

/**
 * Verify a Cloudflare Turnstile token.
 *
 * Cloudflare requires server-side validation.
 * The client-side widget alone is not a security boundary.
 */
function verifyTurnstile_(token) {
    if (!token) {
        return {
            success: false,
            message: "Cloudflare verification is required."
        };
    }

    const properties =
        PropertiesService.getScriptProperties();

    const secret =
        properties.getProperty(
            SECURITY_CONFIG.TURNSTILE_SECRET_PROPERTY
        );

    const expectedHostname =
        properties.getProperty(
            SECURITY_CONFIG.TURNSTILE_HOSTNAME_PROPERTY
        );

    if (!secret) {
        console.error(
            "TURNSTILE_SECRET_KEY is missing."
        );

        return {
            success: false,
            message: "Server security configuration is incomplete."
        };
    }

    const response =
        UrlFetchApp.fetch(
            SECURITY_CONFIG.TURNSTILE_VERIFY_URL,
            {
                method: "post",
                contentType: "application/json",
                payload: JSON.stringify({
                    secret: secret,
                    response: token
                }),
                muteHttpExceptions: true
            }
        );

    let result;

    try {
        result =
            JSON.parse(
                response.getContentText()
            );
    } catch (error) {
        console.error(
            "Invalid Turnstile response."
        );

        return {
            success: false,
            message: "Cloudflare verification failed."
        };
    }

    if (!result.success) {
        console.warn(
            "Turnstile rejected login: " +
            JSON.stringify(
                result["error-codes"] || []
            )
        );

        return {
            success: false,
            message: "Cloudflare verification failed."
        };
    }

    if (
        result.action &&
        result.action !==
            SECURITY_CONFIG.TURNSTILE_ACTION
    ) {
        return {
            success: false,
            message: "Invalid security challenge."
        };
    }

    if (
        expectedHostname &&
        result.hostname &&
        result.hostname !== expectedHostname
    ) {
        return {
            success: false,
            message: "Invalid security host."
        };
    }

    return {
        success: true
    };
}

/**
 * Simple server-side login rate limit.
 *
 * Apps Script does not expose the browser's IP address directly
 * in a reliable, portable way, so this uses a username-based key.
 *
 * For stronger edge protection, add Cloudflare WAF/rate limiting
 * in front of a backend that supports it.
 */
function checkLoginRateLimit_(username) {
    const cache =
        CacheService.getScriptCache();

    const key =
        "login_attempts_" +
        Utilities.base64EncodeWebSafe(
            String(username || "")
                .trim()
                .toLowerCase()
        ).slice(0, 80);

    const current =
        Number(
            cache.get(key) || "0"
        );

    if (
        current >=
        SECURITY_CONFIG.LOGIN_LIMIT
    ) {
        return {
            allowed: false,
            key: key
        };
    }

    return {
        allowed: true,
        key: key,
        count: current
    };
}

function recordLoginFailure_(rateLimit) {
    if (!rateLimit || !rateLimit.key) {
        return;
    }

    const cache =
        CacheService.getScriptCache();

    cache.put(
        rateLimit.key,
        String(
            Number(rateLimit.count || 0) + 1
        ),
        SECURITY_CONFIG.LOGIN_WINDOW_SECONDS
    );
}

function clearLoginFailures_(rateLimit) {
    if (!rateLimit || !rateLimit.key) {
        return;
    }

    CacheService
        .getScriptCache()
        .remove(rateLimit.key);
}

/**
 * Call this at the beginning of your existing login action.
 */
function enforceLoginSecurity_(payload) {
    const username =
        String(
            payload.username || ""
        ).trim();

    const rateLimit =
        checkLoginRateLimit_(username);

    if (!rateLimit.allowed) {
        return {
            success: false,
            message:
                "Too many login attempts. " +
                "Please wait 15 minutes and try again."
        };
    }

    const turnstile =
        verifyTurnstile_(
            payload.turnstileToken
        );

    if (!turnstile.success) {
        recordLoginFailure_(rateLimit);
        return turnstile;
    }

    return {
        success: true,
        rateLimit: rateLimit
    };
}

/**
 * Compare the selected login type with the real user role.
 *
 * NEVER trust requestedRole by itself.
 */
function assertRequestedRole_(actualRole, requestedRole) {
    const actual =
        String(actualRole || "")
            .trim()
            .toUpperCase();

    const requested =
        String(requestedRole || "")
            .trim()
            .toUpperCase();

    if (
        !actual ||
        !requested ||
        actual !== requested
    ) {
        throw new Error(
            "The selected user type does not match the account."
        );
    }

    return true;
}

/**
 * Create a short-lived server-side session.
 *
 * Call this only AFTER:
 * - password verification,
 * - account active-status verification,
 * - requested-role verification.
 */
function createSession_(user) {
    const token =
        Utilities.getUuid() +
        "-" +
        Utilities.getUuid();

    const session = {
        userId:
            user.userId ||
            user.id ||
            "",

        username:
            user.username ||
            "",

        full_name:
            user.full_name ||
            user.name ||
            "",

        role:
            String(
                user.role || ""
            ).toUpperCase(),

        issuedAt:
            Date.now(),

        expiresAt:
            Date.now() +
            SECURITY_CONFIG.SESSION_TTL_SECONDS *
                1000
    };

    CacheService
        .getScriptCache()
        .put(
            "session_" + token,
            JSON.stringify(session),
            SECURITY_CONFIG.SESSION_TTL_SECONDS
        );

    return {
        token: token,
        ...session
    };
}

/**
 * Validate a session before every protected API operation.
 */
function requireSession_(
    token,
    allowedRoles
) {
    if (!token) {
        throw new Error(
            "Authentication is required."
        );
    }

    const raw =
        CacheService
            .getScriptCache()
            .get("session_" + token);

    if (!raw) {
        throw new Error(
            "Your session has expired. Please sign in again."
        );
    }

    let session;

    try {
        session =
            JSON.parse(raw);
    } catch (error) {
        throw new Error(
            "Invalid session."
        );
    }

    const role =
        String(
            session.role || ""
        ).toUpperCase();

    const allowed =
        (allowedRoles || [])
            .map(function (item) {
                return String(item)
                    .toUpperCase();
            });

    if (
        allowed.length &&
        !allowed.includes(role)
    ) {
        throw new Error(
            "You are not authorized for this operation."
        );
    }

    return session;
}

/**
 * Use this when a logout action is available.
 */
function destroySession_(token) {
    if (!token) {
        return;
    }

    CacheService
        .getScriptCache()
        .remove("session_" + token);
}
