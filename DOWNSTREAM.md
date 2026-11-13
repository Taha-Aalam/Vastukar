# Vastukar

Product name: Vastukar

Upstream: https://github.com/datadrivenconstruction/OpenConstructionERP

Baseline upstream commit: 3a4a12699d52b505f2060514f5aecd90963f3863
Last-synced upstream commit: 3a4a12699d52b505f2060514f5aecd90963f3863

Scope: upstream main only. Upstream branches, tags and pull requests are not
copied or tracked. A pull request counts only once it is merged into main.

Relationship: this repository is a direct file copy of upstream main with its
own fresh git history. The two repositories share no merge base. Syncs from
upstream are hand-ports, never merges, rebases or cherry-picks.

Licence: AGPL-3.0. The upstream licence and attribution files are unchanged.

## Divergences — branding rename

Commit 2 renames the displayed product name "OpenConstructionERP" to
"Vastukar" in user- and reader-facing display locations only: the README title
and header text, documentation titles and headings, frontend page titles, headers,
about/login page strings and the backend API title. Package names, import paths,
module and directory names, API routes, database names, environment variable names,
licence and attribution files, and source licence headers are unchanged.

Files changed in this step:

- CONTRIBUTING.md
- DEVELOPING.md
- README.md
- backend/README.md
- backend/app/config.py
- data/catalog/README.md
- deploy/docker/README.md
- deploy/terraform/stackit/README.md
- desktop/README.md
- docs/INSTALL_LINUX.md
- docs/README.md
- docs/api/README.md
- docs/desktop/INSTALL.md
- docs/install/autostart/README.md
- docs/install/azure.de.md
- docs/install/azure.md
- docs/install/azure.ru.md
- docs/platform/README.md
- docs/release/RELEASE_NOTES_v6.4.2.md
- docs/rfc/README.md
- docs/standards/GAEB.md
- frontend/README.md
- frontend/index.html
- frontend/src/app/layout/AppLayout.tsx
- frontend/src/app/layout/CustomBranding.tsx
- frontend/src/app/locales/ar.ts
- frontend/src/app/locales/bg.ts
- frontend/src/app/locales/bn.ts
- frontend/src/app/locales/cs.ts
- frontend/src/app/locales/da.ts
- frontend/src/app/locales/de.ts
- frontend/src/app/locales/el.ts
- frontend/src/app/locales/en-GB.ts
- frontend/src/app/locales/en-US.ts
- frontend/src/app/locales/en.ts
- frontend/src/app/locales/es-CL.ts
- frontend/src/app/locales/es-CO.ts
- frontend/src/app/locales/es-MX.ts
- frontend/src/app/locales/es.ts
- frontend/src/app/locales/et.ts
- frontend/src/app/locales/fa.ts
- frontend/src/app/locales/fi.ts
- frontend/src/app/locales/fil.ts
- frontend/src/app/locales/fr.ts
- frontend/src/app/locales/he.ts
- frontend/src/app/locales/hi.ts
- frontend/src/app/locales/hr.ts
- frontend/src/app/locales/hu.ts
- frontend/src/app/locales/id.ts
- frontend/src/app/locales/it.ts
- frontend/src/app/locales/ja.ts
- frontend/src/app/locales/kk.ts
- frontend/src/app/locales/ko.ts
- frontend/src/app/locales/ky.ts
- frontend/src/app/locales/mn.ts
- frontend/src/app/locales/nl.ts
- frontend/src/app/locales/no.ts
- frontend/src/app/locales/pl.ts
- frontend/src/app/locales/pt-BR.ts
- frontend/src/app/locales/pt.ts
- frontend/src/app/locales/ro.ts
- frontend/src/app/locales/ru.ts
- frontend/src/app/locales/sv.ts
- frontend/src/app/locales/th.ts
- frontend/src/app/locales/tr.ts
- frontend/src/app/locales/uk.ts
- frontend/src/app/locales/ur.ts
- frontend/src/app/locales/uz.ts
- frontend/src/app/locales/vi.ts
- frontend/src/app/locales/zh.ts
- frontend/src/features/about/AboutPage.tsx
- frontend/src/features/auth/LoginPage.tsx
- frontend/src/features/auth/LoginPageNext.tsx
- frontend/src/features/auth/RegisterPage.tsx
- frontend/src/features/onboarding/OnboardingWizard.tsx
- frontend/src/shared/ui/Logo.tsx
- llms.txt
- packs/aus/README.md
- packs/batimatech-ca/README.md
- packs/doker-formwork/README.md
- packs/nzs/README.md
- packs/saudi-vision2030/README.md
## Divergences — UI rebrand round 2 (user-visible brand removal)

A display/content pass that removes every user-visible trace of the
upstream brand from the running app: the product name in every locale
and hardcoded UI string (including wordmarks split across styled spans),
the "DDC" acronym in user-visible strings, upstream URLs/handles, the
positioning copy, the sidebar version + licence footer, the Videos/
academy feature surfaces, the served HTML/assets (meta tags, PWA
manifest, splash, policy/terms pages, favicon, templates), the case
content branding, and backend-served display strings (emails, document/
Excel/IFC/GAEB exports, CLI output, API metadata, demo seed data).

Out of scope by instruction and left unchanged: LICENSE, NOTICE,
AUTHORS.md, COPYRIGHT, the licence-text test, code comment headers
(including the DDC-CWICR-OE lines), package names, imports, API routes,
env vars, database names, internal manifests, the changelog's
historical version entries, and git history.

Files changed in this step:

- DOWNSTREAM.md
- backend/app/__main__.py
- backend/app/cli.py
- backend/app/config.py
- backend/app/core/converter_package.py
- backend/app/core/demo_accounts.py
- backend/app/core/demo_admin.py
- backend/app/core/demo_cast.py
- backend/app/core/demo_ifc_generator.py
- backend/app/core/demo_placeholders.py
- backend/app/core/demo_read_only.py
- backend/app/core/email/templates.py
- backend/app/core/embedded_pg.py
- backend/app/core/marketplace.py
- backend/app/core/partner_pack/manifest.py
- backend/app/core/pdf_branding.py
- backend/app/core/translation/downloader.py
- backend/app/main.py
- backend/app/middleware/fingerprint.py
- backend/app/modules/accounting_sync/exports/datev.py
- backend/app/modules/accounting_sync/exports/saft.py
- backend/app/modules/admin/__init__.py
- backend/app/modules/admin/service.py
- backend/app/modules/ai/ai_client.py
- backend/app/modules/backup/service.py
- backend/app/modules/bcf/bcf_xml.py
- backend/app/modules/bcf/service.py
- backend/app/modules/bim_hub/exporters/boq_xlsx.py
- backend/app/modules/bim_hub/exporters/cobie.py
- backend/app/modules/bim_hub/router.py
- backend/app/modules/bim_requirements/exporters/excel_exporter.py
- backend/app/modules/bim_requirements/exporters/ids_exporter.py
- backend/app/modules/bimlv/container.py
- backend/app/modules/boq/exporters/bc3.py
- backend/app/modules/boq/gaeb_common.py
- backend/app/modules/boq/pdf_export.py
- backend/app/modules/boq/router.py
- backend/app/modules/costs/router.py
- backend/app/modules/design_options/exporters.py
- backend/app/modules/einvoice_ksef/fa3.py
- backend/app/modules/field_diary/service.py
- backend/app/modules/file_transmittals/service.py
- backend/app/modules/finance/br_invoice_pdf.py
- backend/app/modules/geo_hub/ogc_router.py
- backend/app/modules/geo_hub/router.py
- backend/app/modules/integrations/discord.py
- backend/app/modules/integrations/router.py
- backend/app/modules/integrations/service.py
- backend/app/modules/meetings/ics.py
- backend/app/modules/methodology/service.py
- backend/app/modules/notifications/email_render.py
- backend/app/modules/procurement/requisition_service.py
- backend/app/modules/projects/bundle_export.py
- backend/app/modules/projects/file_manager_schemas.py
- backend/app/modules/property_dev/router.py
- backend/app/modules/property_dev/service.py
- backend/app/modules/requirements/excel_io.py
- backend/app/modules/takeoff/manifest_verifier.py
- backend/app/modules/tendering/pdf_documents.py
- backend/app/modules/tendering/workbooks.py
- backend/app/modules/users/repository.py
- backend/app/modules/validation/sarif_exporter.py
- backend/app/scripts/export_showcase_snapshot.py
- backend/app/scripts/generate_grundriss_pdf.py
- backend/app/scripts/seed_demo_4d5d.py
- backend/app/scripts/seed_demo_estimates.py
- backend/locales/ar.json
- backend/locales/bg.json
- backend/locales/bn.json
- backend/locales/cs.json
- backend/locales/da.json
- backend/locales/de.json
- backend/locales/el.json
- backend/locales/en.json
- backend/locales/es.json
- backend/locales/et.json
- backend/locales/fa.json
- backend/locales/fi.json
- backend/locales/fil.json
- backend/locales/fr.json
- backend/locales/he.json
- backend/locales/hi.json
- backend/locales/hr.json
- backend/locales/hu.json
- backend/locales/id.json
- backend/locales/it.json
- backend/locales/ja.json
- backend/locales/kk.json
- backend/locales/ko.json
- backend/locales/ky.json
- backend/locales/nl.json
- backend/locales/no.json
- backend/locales/pl.json
- backend/locales/pt.json
- backend/locales/ro.json
- backend/locales/ru.json
- backend/locales/sv.json
- backend/locales/th.json
- backend/locales/tr.json
- backend/locales/uk.json
- backend/locales/ur.json
- backend/locales/uz.json
- backend/locales/vi.json
- backend/locales/zh.json
- backend/tests/conftest.py
- backend/tests/integration/core/test_deployment_posture.py
- backend/tests/integration/test_admin_qa_reset.py
- backend/tests/integration/test_demo_login_endpoint.py
- backend/tests/integration/test_demo_login_toggle.py
- backend/tests/integration/test_register_bootstrap.py
- backend/tests/integration/test_system_upgrade_auth.py
- backend/tests/integration/test_validation_api.py
- backend/tests/modules/test_reporting_progress.py
- backend/tests/pg/elf_qa_fixtures.py
- backend/tests/pg/test_a_demo_admin_can_install_a_country_pack.py
- backend/tests/pg/test_demo_seed_stays_in_demo_projects.py
- backend/tests/pg/test_eleven_areas_flows_c.py
- backend/tests/pg/test_every_get_route_answers_on_a_fresh_install.py
- backend/tests/pg/test_every_pack_installs.py
- backend/tests/pg/test_governance_demo_placement.py
- backend/tests/pg/test_governance_demo_seed.py
- backend/tests/pg/test_version_check_release_metadata.py
- backend/tests/test_partner_pack_core.py
- backend/tests/unit/test_a_generated_report_is_written_in_the_readers_language.py
- backend/tests/unit/test_basemap_upstream_policy.py
- backend/tests/unit/test_bc3_import_reads_the_charset_its_header_declares.py
- backend/tests/unit/test_cli_startup_banner_does_not_claim_readiness.py
- backend/tests/unit/test_cli_version_flag_matches_the_version_command.py
- backend/tests/unit/test_converter_install_integrity.py
- backend/tests/unit/test_demo_admin_login_superseded_by_a_real_admin.py
- backend/tests/unit/test_demo_credentials.py
- backend/tests/unit/test_desktop_bootstrap.py
- backend/tests/unit/test_email_plain_text_link.py
- backend/tests/unit/test_email_service.py
- backend/tests/unit/test_erp_chat_fallback_provider.py
- backend/tests/unit/test_every_email_carries_the_brand.py
- backend/tests/unit/test_mail_never_reaches_a_login_that_is_not_a_mailbox.py
- backend/tests/unit/test_market_scope_tenancy.py
- backend/tests/unit/test_notification_email_links.py
- backend/tests/unit/test_notification_email_locale.py
- backend/tests/unit/test_outgoing_documents_print_the_company_letterhead.py
- backend/tests/unit/test_pack_install_says_what_it_did.py
- backend/tests/unit/test_pdf_letterhead.py
- backend/tests/unit/test_portal_login_email.py
- backend/tests/unit/test_qa_reset_host_is_the_last_gate.py
- backend/tests/unit/test_registration_bootstrap_admin.py
- backend/tests/unit/test_rfi_pdf.py
- backend/tests/unit/test_the_api_docs_page_does_not_need_the_internet.py
- backend/tests/unit/test_version_fallback_names_a_version.py
- frontend/index.html
- frontend/public/README.md
- frontend/public/favicon.svg
- frontend/public/privacy-policy.html
- frontend/public/splash.html
- frontend/public/templates/es-pbc-sample.bc3
- frontend/public/terms.html
- frontend/src/app/App.tsx
- frontend/src/app/layout/BugReportMenuLinks.test.tsx
- frontend/src/app/layout/CustomBranding.tsx
- frontend/src/app/layout/Header.tsx
- frontend/src/app/layout/LearnTopBarButton.tsx
- frontend/src/app/layout/Sidebar.footer.test.tsx
- frontend/src/app/layout/Sidebar.learn.test.tsx
- frontend/src/app/layout/Sidebar.tsx
- frontend/src/app/layout/Sidebar.workspace.test.tsx
- frontend/src/app/layout/SubscribeButton.tsx
- frontend/src/app/layout/SupportUsButton.tsx
- frontend/src/app/layout/navCatalog.ts
- frontend/src/app/locales/ar.ts
- frontend/src/app/locales/bg.ts
- frontend/src/app/locales/bn.ts
- frontend/src/app/locales/cs.ts
- frontend/src/app/locales/da.ts
- frontend/src/app/locales/de.ts
- frontend/src/app/locales/el.ts
- frontend/src/app/locales/en-GB.ts
- frontend/src/app/locales/en-US.ts
- frontend/src/app/locales/en.ts
- frontend/src/app/locales/es-CL.ts
- frontend/src/app/locales/es-CO.ts
- frontend/src/app/locales/es-MX.ts
- frontend/src/app/locales/es.ts
- frontend/src/app/locales/et.ts
- frontend/src/app/locales/fa.ts
- frontend/src/app/locales/fi.ts
- frontend/src/app/locales/fil.ts
- frontend/src/app/locales/fr.ts
- frontend/src/app/locales/he.ts
- frontend/src/app/locales/hi.ts
- frontend/src/app/locales/hr.ts
- frontend/src/app/locales/hu.ts
- frontend/src/app/locales/id.ts
- frontend/src/app/locales/it.ts
- frontend/src/app/locales/ja.ts
- frontend/src/app/locales/kk.ts
- frontend/src/app/locales/ko.ts
- frontend/src/app/locales/ky.ts
- frontend/src/app/locales/mn.ts
- frontend/src/app/locales/nl.ts
- frontend/src/app/locales/no.ts
- frontend/src/app/locales/pl.ts
- frontend/src/app/locales/pt-BR.ts
- frontend/src/app/locales/pt.ts
- frontend/src/app/locales/ro.ts
- frontend/src/app/locales/ru.ts
- frontend/src/app/locales/sv.ts
- frontend/src/app/locales/th.ts
- frontend/src/app/locales/tr.ts
- frontend/src/app/locales/uk.ts
- frontend/src/app/locales/ur.ts
- frontend/src/app/locales/uz.ts
- frontend/src/app/locales/vi.ts
- frontend/src/app/locales/zh.ts
- frontend/src/features/about/AboutPage.tsx
- frontend/src/features/about/ThirdPartyLicenses.tsx
- frontend/src/features/ai/QuickEstimatePage.tsx
- frontend/src/features/analytics/performance.ts
- frontend/src/features/auth/ClassicAuth.tsx
- frontend/src/features/auth/LoginPage.tsx
- frontend/src/features/auth/LoginPageNext.tsx
- frontend/src/features/auth/RegisterPage.tsx
- frontend/src/features/bcf/issueReport.ts
- frontend/src/features/bim/AutoInstallConverterNotice.tsx
- frontend/src/features/bim/BIMConverterStatusBanner.tsx
- frontend/src/features/bim/BIMPage.tsx
- frontend/src/features/bim/BIMQuantityRulesPage.prefill.test.tsx
- frontend/src/features/bim/InstallConverterPrompt.tsx
- frontend/src/features/bim/PropertySearchPanel.tsx
- frontend/src/features/bim/__tests__/converterPackageMissing.test.ts
- frontend/src/features/bim/__tests__/importWithoutQuantitiesSaysSo.test.tsx
- frontend/src/features/bim/api.ts
- frontend/src/features/bim/printReport.ts
- frontend/src/features/bim/reviewMinutes.ts
- frontend/src/features/bim_requirements/SEED_PACKS.ts
- frontend/src/features/boq/grid/cellRenderers.tsx
- frontend/src/features/buyer-portal/BuyerPortalPage.tsx
- frontend/src/features/cad-explorer/CadDataExplorerPage.tsx
- frontend/src/features/cases/FeaturedArticle.tsx
- frontend/src/features/cases/PlaybookRunner.tsx
- frontend/src/features/changeorders/ChangeOrdersPage.tsx
- frontend/src/features/costs/ImportDatabasePage.tsx
- frontend/src/features/daily-diary/DailyDiaryPage.tsx
- frontend/src/features/dashboard/DashboardCasesCard.tsx
- frontend/src/features/dashboard/DashboardPage.tsx
- frontend/src/features/dashboard/__tests__/DashboardCasesCard.test.tsx
- frontend/src/features/dashboard/__tests__/contentLanguage.test.ts
- frontend/src/features/data-security/__tests__/DataSecurityPanel.test.tsx
- frontend/src/features/dwg-takeoff/DwgTakeoffPage.tsx
- frontend/src/features/dwg-takeoff/dwgTakeoffGuide.ts
- frontend/src/features/dwg-takeoff/lib/dwg-quantify-export.ts
- frontend/src/features/file-manager/SharePage.tsx
- frontend/src/features/file-manager/components/EmailDialog.tsx
- frontend/src/features/finance/FinancePage.tsx
- frontend/src/features/finance/RetentionLedgerTab.tsx
- frontend/src/features/help/DemoQuickStart.test.tsx
- frontend/src/features/help/DemoQuickStart.tsx
- frontend/src/features/inside/InsidePage.tsx
- frontend/src/features/integrations/IntegrationsPage.tsx
- frontend/src/features/integrations/integrationsGuide.ts
- frontend/src/features/match-elements/CataloguesPanelCard.tsx
- frontend/src/features/match-elements/EmbedderStatusCard.tsx
- frontend/src/features/match-elements/MatchWizardFlow.tsx
- frontend/src/features/modules/ModuleDeveloperGuide.tsx
- frontend/src/features/modules/ModulesPage.tsx
- frontend/src/features/modules/PartnerPackApplyDialog.tsx
- frontend/src/features/modules/RequestCustomModuleDialog.tsx
- frontend/src/features/modules/__tests__/ModuleTogglesSection.i18n.test.tsx
- frontend/src/features/modules/__tests__/PartnerPackApplyDialog.test.tsx
- frontend/src/features/modules/__tests__/RequestCustomModuleDialog.test.tsx
- frontend/src/features/modules/moduleDeveloperGuide.md
- frontend/src/features/onboarding/OnboardingWizard.tsx
- frontend/src/features/payment-clock/PaymentClockPage.tsx
- frontend/src/features/portal/PortalBrandHeader.tsx
- frontend/src/features/portal/PortalHomePage.tsx
- frontend/src/features/portal/PortalPaymentsPage.tsx
- frontend/src/features/projects/ProjectDetailPage.tsx
- frontend/src/features/property-dev/DocumentTemplatesSettingsPage.tsx
- frontend/src/features/property-dev/ValidationRulesSettingsPage.tsx
- frontend/src/features/punchlist/PunchListPage.tsx
- frontend/src/features/quantities/QuantitiesPage.tsx
- frontend/src/features/reports/ReportsPage.tsx
- frontend/src/features/settings/BackupRestore.tsx
- frontend/src/features/settings/SettingsPage.tsx
- frontend/src/features/settings/SettingsTeamPanel.tsx
- frontend/src/features/settings/settingsGuide.ts
- frontend/src/features/takeoff/lib/takeoff-export.ts
- frontend/src/features/tendering/TenderingPage.tsx
- frontend/src/features/translation/api.ts
- frontend/src/features/videos/videoHints.test.tsx
- frontend/src/index.css
- frontend/src/modules/_i18n.test.ts
- frontend/src/modules/cost-benchmark/data/benchmarks.ts
- frontend/src/modules/ddc-ifc-converter/manifest.ts
- frontend/src/modules/ddc-rvt-converter/manifest.ts
- frontend/src/modules/gaeb-exchange/GAEBExchangeModule.test.tsx
- frontend/src/modules/gaeb-exchange/data/gaebExport.ts
- frontend/src/modules/regional-exchange/RegionalExchangePage.test.tsx
- frontend/src/pwa/__tests__/staticAssetRoute.test.ts
- frontend/src/shared/lib/bimQuantityWarning.ts
- frontend/src/shared/lib/converterReleaseNotice.ts
- frontend/src/shared/lib/desktop.test.ts
- frontend/src/shared/lib/routePreload.ts
- frontend/src/shared/ui/BIMViewer/BIMViewer.tsx
- frontend/src/shared/ui/BIMViewer/ElementManager.ts
- frontend/src/shared/ui/BetaBanner.tsx
- frontend/src/shared/ui/CommandPalette.academy.test.tsx
- frontend/src/shared/ui/CommandPalette.tsx
- frontend/src/shared/ui/DemoBanner.tsx
- frontend/src/shared/ui/DemoReadOnlyDialog.test.tsx
- frontend/src/shared/ui/DemoReadOnlyDialog.tsx
- frontend/src/shared/ui/ErrorState.test.tsx
- frontend/src/shared/ui/FeedbackDialog.tsx
- frontend/src/shared/ui/HeaderNewsButton.tsx
- frontend/src/shared/ui/PartnerLogoBadge.test.tsx
- frontend/src/shared/ui/RecoveryCard.test.tsx
- frontend/src/shared/ui/RecoveryCard.tsx
- frontend/src/shared/ui/ReviewPromptCard.test.tsx
- frontend/src/shared/ui/ReviewPromptCard.tsx
- frontend/src/shared/ui/__tests__/ConverterReleaseNotice.test.tsx
- frontend/src/shared/ui/__tests__/updateNotice.test.tsx
- frontend/src/tests/__snapshots__/visual-regression.test.tsx.snap
- frontend/tests/e2e/comprehensive/full-e2e.spec.ts
- frontend/tests/pwa/manifest.test.ts
- frontend/vite.config.ts
- scripts/i18n_leak_allowlist.json
