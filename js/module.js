/*
 * Modern Convent School
 * Shared CRUD controller for admin data pages.
 *
 * Each admin HTML page supplies its module configuration through
 * data-module-* attributes on <body>. No inline JavaScript is needed.
 */
(function () {
    "use strict";

    const $ = function (id) {
        return document.getElementById(id);
    };

    const state = {
        rows: [],
        editing: null,
        config: null
    };

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(
                /[&<>'"]/g,
                function (character) {
                    return {
                        "&": "&amp;",
                        "<": "&lt;",
                        ">": "&gt;",
                        "'": "&#39;",
                        '"': "&quot;"
                    }[character];
                }
            );
    }

    function parseList(value) {
        return String(value || "")
            .split(",")
            .map(function (item) {
                return item.trim();
            })
            .filter(Boolean);
    }

    function readConfig() {
        const body = document.body;

        return {
            title:
                body.dataset.moduleTitle || "Records",

            get:
                body.dataset.moduleGet || "",

            add:
                body.dataset.moduleAdd || "",

            update:
                body.dataset.moduleUpdate || "",

            delete:
                body.dataset.moduleDelete || "",

            deactivate:
                body.dataset.moduleDeactivate || "",

            id:
                body.dataset.moduleId || "id",

            columns:
                parseList(
                    body.dataset.moduleColumns
                ),

            fields:
                parseList(
                    body.dataset.moduleFields
                )
        };
    }

    function normaliseRows(data) {
        if (Array.isArray(data)) {
            return data;
        }

        return (
            data?.rows ||
            data?.records ||
            data?.items ||
            []
        );
    }

    function showToast(
        message,
        isError = false
    ) {
        const toast = $("toast");

        if (!toast) {
            return;
        }

        toast.textContent = message;
        toast.className =
            "toast show" +
            (isError ? " error" : "");

        clearTimeout(
            showToast.timer
        );

        showToast.timer =
            setTimeout(
                function () {
                    toast.className =
                        "toast";
                },
                3500
            );
    }

    function render() {
        const search =
            $("search").value
                .trim()
                .toLowerCase();

        const visible =
            state.rows.filter(function (row) {
                return (
                    !search ||
                    Object.values(row)
                        .join(" ")
                        .toLowerCase()
                        .includes(search)
                );
            });

        $("body").innerHTML =
            visible
                .map(function (row) {
                    const cells =
                        state.config.columns
                            .map(function (key) {
                                return `
                                    <td>
                                        ${escapeHtml(
                                            row[key] ?? "—"
                                        )}
                                    </td>
                                `;
                            })
                            .join("");

                    const id =
                        escapeHtml(
                            row[state.config.id]
                        );

                    const actions = [];

                    if (state.config.update) {
                        actions.push(`
                            <button
                                class="btn btn-small btn-light"
                                type="button"
                                data-edit="${id}"
                            >
                                Edit
                            </button>
                        `);
                    }

                    if (state.config.deactivate) {
                        actions.push(`
                            <button
                                class="btn btn-small btn-warning"
                                type="button"
                                data-deactivate="${id}"
                            >
                                Deactivate
                            </button>
                        `);
                    }

                    if (state.config.delete) {
                        actions.push(`
                            <button
                                class="btn btn-small btn-danger-outline"
                                type="button"
                                data-delete="${id}"
                            >
                                Delete
                            </button>
                        `);
                    }

                    return `
                        <tr>
                            ${cells}
                            <td>
                                <div class="row-actions">
                                    ${actions.join("")}
                                </div>
                            </td>
                        </tr>
                    `;
                })
                .join("");

        $("empty").hidden =
            visible.length !== 0;

        const table =
            document.querySelector(
                ".admin-table"
            );

        if (table) {
            table
                .querySelector("thead")
                .style.display =
                visible.length
                    ? ""
                    : "none";
        }
    }

    async function load() {
        if (!MCSApi.configured()) {
            state.rows = [];
            render();

            showToast(
                "Google Apps Script API is not configured.",
                true
            );

            return;
        }

        try {
            const data =
                await MCSApi.get(
                    state.config.get
                );

            state.rows =
                normaliseRows(data);

            render();
        } catch (error) {
            state.rows = [];
            render();

            showToast(
                error.message ||
                "Unable to load records.",
                true
            );
        }
    }

    function openModal(row) {
        state.editing = row || null;

        $("modal").hidden = false;
        $("modalTitle").textContent =
            row
                ? `Edit ${state.config.title}`
                : `Add ${state.config.title}`;

        $("recordId").value =
            row?.[state.config.id] || "";

        $("error").textContent = "";

        state.config.fields.forEach(
            function (key) {
                const field =
                    $(`f_${key}`);

                if (field) {
                    field.value =
                        row?.[key] ?? "";
                }
            }
        );

        const firstField =
            document.querySelector(
                "#form input:not([type='hidden']), " +
                "#form select, " +
                "#form textarea"
            );

        if (firstField) {
            setTimeout(
                function () {
                    firstField.focus();
                },
                50
            );
        }
    }

    function closeModal() {
        $("modal").hidden = true;
        $("form").reset();
        $("recordId").value = "";
        $("error").textContent = "";
        state.editing = null;
    }

    async function save(event) {
        event.preventDefault();

        if (!MCSApi.configured()) {
            showToast(
                "API URL is not configured. No data was saved.",
                true
            );

            return;
        }

        const data = {};

        state.config.fields.forEach(
            function (key) {
                const field =
                    $(`f_${key}`);

                data[key] =
                    field?.value?.trim?.() ??
                    field?.value ??
                    "";
            }
        );

        const recordId =
            $("recordId").value.trim();

        const action =
            recordId
                ? state.config.update
                : state.config.add;

        if (!action) {
            showToast(
                "This page does not allow that operation.",
                true
            );

            return;
        }

        try {
            await MCSApi.post(
                action,
                recordId
                    ? {
                        [state.config.id]:
                            recordId,
                        ...data
                    }
                    : data
            );

            closeModal();

            showToast(
                recordId
                    ? "Record updated successfully."
                    : "Record added successfully."
            );

            await load();
        } catch (error) {
            $("error").textContent =
                error.message ||
                "Unable to save the record.";

            showToast(
                error.message ||
                "Unable to save the record.",
                true
            );
        }
    }

    async function performAction(
        actionType,
        recordId
    ) {
        const row =
            state.rows.find(function (item) {
                return String(
                    item[state.config.id]
                ) === String(recordId);
            });

        if (
            actionType === "edit"
        ) {
            openModal(row);
            return;
        }

        const action =
            actionType === "delete"
                ? state.config.delete
                : state.config.deactivate;

        if (!action) {
            return;
        }

        const message =
            actionType === "delete"
                ? "Permanently delete this record? This cannot be undone."
                : "Deactivate this record?";

        if (!window.confirm(message)) {
            return;
        }

        try {
            await MCSApi.post(
                action,
                {
                    [state.config.id]:
                        recordId
                }
            );

            showToast(
                actionType === "delete"
                    ? "Record deleted successfully."
                    : "Record deactivated successfully."
            );

            await load();
        } catch (error) {
            showToast(
                error.message ||
                "The requested action failed.",
                true
            );
        }
    }

    function configureAddButton() {
        const button = $("add");

        if (!button) {
            return;
        }

        /*
         * Settings and similar modules can be update-only.
         */
        if (!state.config.add) {
            button.hidden = true;
        }
    }

    function bindEvents() {
        $("add")?.addEventListener(
            "click",
            function () {
                openModal();
            }
        );

        $("reload")?.addEventListener(
            "click",
            load
        );

        $("search")?.addEventListener(
            "input",
            render
        );

        $("close")?.addEventListener(
            "click",
            closeModal
        );

        $("cancel")?.addEventListener(
            "click",
            closeModal
        );

        $("form")?.addEventListener(
            "submit",
            save
        );

        $("modal")?.addEventListener(
            "click",
            function (event) {
                if (
                    event.target ===
                    $("modal")
                ) {
                    closeModal();
                }
            }
        );

        document.addEventListener(
            "keydown",
            function (event) {
                if (
                    event.key === "Escape" &&
                    !$("modal").hidden
                ) {
                    closeModal();
                }
            }
        );

        $("body")?.addEventListener(
            "click",
            function (event) {
                const button =
                    event.target.closest(
                        "[data-edit], [data-delete], [data-deactivate]"
                    );

                if (!button) {
                    return;
                }

                if (button.dataset.edit) {
                    performAction(
                        "edit",
                        button.dataset.edit
                    );
                }

                if (button.dataset.delete) {
                    performAction(
                        "delete",
                        button.dataset.delete
                    );
                }

                if (button.dataset.deactivate) {
                    performAction(
                        "deactivate",
                        button.dataset.deactivate
                    );
                }
            }
        );
    }

    document.addEventListener(
        "DOMContentLoaded",
        async function () {
            state.config =
                readConfig();

            configureAddButton();
            bindEvents();
            await load();
        }
    );
})();
