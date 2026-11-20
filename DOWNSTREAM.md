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
- backend/tests/unit/test_pdf_appearance_reaches_the_renderer.py
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
- scripts/i18n_leak_baseline.json
- scripts/i18n_leak_cluster_snapshot.json

### Completion pass — remaining user-visible traces (same PR, later pass)

Finishes the round-2 sweep: the module manifest `author` field (rendered on
the Modules page by ModulesPage.tsx), the residual locale keys (costs import
attribution, About services/book/founder-bio copy, the positioning trio
login.hero_desc / dashboard.welcome_sub / support.action_share_body), the
About page's remaining upstream links, the upstream brand images, and the
sidebar footer's version tooltip.

Files changed in this step:

- backend/app/core/self_upgrade.py (RELEASES_URL follows the Vastukar repo - the previous mixed slug datadrivenconstruction/Vastukar pointed at a nonexistent repo)
- frontend/src/app/__tests__/everyBrandAssetExists.test.ts
- frontend/src/app/layout/Sidebar.tsx
- frontend/public/brand/artem-boiko-avatar.png (DELETED - upstream founder avatar, unreferenced)
- frontend/public/brand/ddc-book.png (DELETED - replaced by vastukar-book.png)
- frontend/public/brand/ddc-logo.png (DELETED - replaced by vastukar-logo.png)
- frontend/public/brand/ddc-logo.webp (DELETED - replaced by vastukar-logo.webp)
- frontend/public/brand/vastukar-book.png (ADDED)
- frontend/public/brand/vastukar-logo.png (ADDED)
- frontend/public/brand/vastukar-logo.webp (ADDED)
- scripts/i18n_leak_allowlist.json (about.book_title entry follows the rebranded value)

Module manifests - the `author="OpenConstructionERP Core Team"` field that the
Modules page renders was set to `author="Vastukar"` in all of them:


- backend/app/modules/accommodation/manifest.py
- backend/app/modules/accounting_sync/manifest.py
- backend/app/modules/admin/manifest.py
- backend/app/modules/ai/manifest.py
- backend/app/modules/ai_agents/manifest.py
- backend/app/modules/ai_estimator/manifest.py
- backend/app/modules/allowances/manifest.py
- backend/app/modules/approval_routes/manifest.py
- backend/app/modules/architecture_map/manifest.py
- backend/app/modules/asia_pac_pack/manifest.py
- backend/app/modules/assemblies/manifest.py
- backend/app/modules/assets/manifest.py
- backend/app/modules/authority_submission/manifest.py
- backend/app/modules/backup/manifest.py
- backend/app/modules/bcf/manifest.py
- backend/app/modules/bi_feed/manifest.py
- backend/app/modules/bid_day/manifest.py
- backend/app/modules/bid_management/manifest.py
- backend/app/modules/bid_no_bid/manifest.py
- backend/app/modules/bim_hub/manifest.py
- backend/app/modules/bim_requirements/manifest.py
- backend/app/modules/bimlv/manifest.py
- backend/app/modules/boq/manifest.py
- backend/app/modules/cad/manifest.py
- backend/app/modules/capital_plan/manifest.py
- backend/app/modules/carbon/manifest.py
- backend/app/modules/cases/manifest.py
- backend/app/modules/catalog/manifest.py
- backend/app/modules/cde/manifest.py
- backend/app/modules/certified_payroll/manifest.py
- backend/app/modules/change_intelligence/manifest.py
- backend/app/modules/changeorders/manifest.py
- backend/app/modules/china_pack/manifest.py
- backend/app/modules/claims_evidence/manifest.py
- backend/app/modules/clash/manifest.py
- backend/app/modules/clash_ai_triage/manifest.py
- backend/app/modules/clash_cost_impact/manifest.py
- backend/app/modules/client_errors/manifest.py
- backend/app/modules/closeout/manifest.py
- backend/app/modules/collaboration/manifest.py
- backend/app/modules/collaboration_locks/manifest.py
- backend/app/modules/commitment_release/manifest.py
- backend/app/modules/compliance/manifest.py
- backend/app/modules/compliance_ai/manifest.py
- backend/app/modules/compliance_docs/manifest.py
- backend/app/modules/condition/manifest.py
- backend/app/modules/connectors/manifest.py
- backend/app/modules/construction_control/manifest.py
- backend/app/modules/contacts/manifest.py
- backend/app/modules/contracts/manifest.py
- backend/app/modules/coordination_hub/manifest.py
- backend/app/modules/correspondence/manifest.py
- backend/app/modules/cost_benchmarks/manifest.py
- backend/app/modules/cost_explorer/manifest.py
- backend/app/modules/cost_match/manifest.py
- backend/app/modules/cost_plan/manifest.py
- backend/app/modules/cost_recovery/manifest.py
- backend/app/modules/costmodel/manifest.py
- backend/app/modules/costs/manifest.py
- backend/app/modules/credentials/manifest.py
- backend/app/modules/crm/manifest.py
- backend/app/modules/cutting/manifest.py
- backend/app/modules/cvr/manifest.py
- backend/app/modules/dach_pack/manifest.py
- backend/app/modules/daily_diary/manifest.py
- backend/app/modules/dashboard/manifest.py
- backend/app/modules/dashboards/manifest.py
- backend/app/modules/deadlines/manifest.py
- backend/app/modules/defects_liability/manifest.py
- backend/app/modules/delivery_model/manifest.py
- backend/app/modules/design_management/manifest.py
- backend/app/modules/design_options/manifest.py
- backend/app/modules/dispatch/manifest.py
- backend/app/modules/doc_assistant/manifest.py
- backend/app/modules/documents/manifest.py
- backend/app/modules/dwg_takeoff/manifest.py
- backend/app/modules/eac/manifest.py
- backend/app/modules/economics/manifest.py
- backend/app/modules/einvoice/manifest.py
- backend/app/modules/einvoice_clearance/manifest.py
- backend/app/modules/einvoice_eta/manifest.py
- backend/app/modules/einvoice_ksef/manifest.py
- backend/app/modules/einvoice_zatca/manifest.py
- backend/app/modules/engineering_brief/manifest.py
- backend/app/modules/enterprise_workflows/manifest.py
- backend/app/modules/equipment/manifest.py
- backend/app/modules/erp_chat/manifest.py
- backend/app/modules/esg/manifest.py
- backend/app/modules/estimate_basis/manifest.py
- backend/app/modules/estimate_checks/manifest.py
- backend/app/modules/estimate_rollup/manifest.py
- backend/app/modules/field_diary/manifest.py
- backend/app/modules/field_time/manifest.py
- backend/app/modules/fieldreports/manifest.py
- backend/app/modules/file_approvals/manifest.py
- backend/app/modules/file_comments/manifest.py
- backend/app/modules/file_distribution/manifest.py
- backend/app/modules/file_favorites/manifest.py
- backend/app/modules/file_references/manifest.py
- backend/app/modules/file_saved_views/manifest.py
- backend/app/modules/file_search/manifest.py
- backend/app/modules/file_tags/manifest.py
- backend/app/modules/file_transmittals/manifest.py
- backend/app/modules/file_trash/manifest.py
- backend/app/modules/file_versions/manifest.py
- backend/app/modules/finance/manifest.py
- backend/app/modules/forms/manifest.py
- backend/app/modules/formwork/manifest.py
- backend/app/modules/full_evm/manifest.py
- backend/app/modules/funding/manifest.py
- backend/app/modules/fx/manifest.py
- backend/app/modules/geo_hub/manifest.py
- backend/app/modules/global_presence/manifest.py
- backend/app/modules/guarantees/manifest.py
- backend/app/modules/haul_tickets/manifest.py
- backend/app/modules/hse_advanced/manifest.py
- backend/app/modules/hse_frame/manifest.py
- backend/app/modules/i18n_foundation/manifest.py
- backend/app/modules/inbound_capture/manifest.py
- backend/app/modules/inbound_email/manifest.py
- backend/app/modules/india_pack/manifest.py
- backend/app/modules/inspections/manifest.py
- backend/app/modules/integrations/manifest.py
- backend/app/modules/interface_management/manifest.py
- backend/app/modules/jobs/manifest.py
- backend/app/modules/labor_rates/manifest.py
- backend/app/modules/latam_pack/manifest.py
- backend/app/modules/leasing/manifest.py
- backend/app/modules/legal_entities/manifest.py
- backend/app/modules/lessons_learned/manifest.py
- backend/app/modules/list_views/manifest.py
- backend/app/modules/markups/manifest.py
- backend/app/modules/match/manifest.py
- backend/app/modules/match_elements/manifest.py
- backend/app/modules/mcp/manifest.py
- backend/app/modules/measurement/manifest.py
- backend/app/modules/measurement_book/manifest.py
- backend/app/modules/meetings/manifest.py
- backend/app/modules/methodology/manifest.py
- backend/app/modules/mexico_pack/manifest.py
- backend/app/modules/middle_east_pack/manifest.py
- backend/app/modules/moc/manifest.py
- backend/app/modules/module_builder/manifest.py
- backend/app/modules/ncr/manifest.py
- backend/app/modules/norm_expansion/manifest.py
- backend/app/modules/notifications/manifest.py
- backend/app/modules/offers/manifest.py
- backend/app/modules/onboarding/manifest.py
- backend/app/modules/opencde_api/manifest.py
- backend/app/modules/owner_schedule/manifest.py
- backend/app/modules/payment_clock/manifest.py
- backend/app/modules/payment_release/manifest.py
- backend/app/modules/payroll/manifest.py
- backend/app/modules/permits/manifest.py
- backend/app/modules/phonelog/manifest.py
- backend/app/modules/photos/manifest.py
- backend/app/modules/pipelines/manifest.py
- backend/app/modules/plant_register/manifest.py
- backend/app/modules/pointcloud/manifest.py
- backend/app/modules/portal/manifest.py
- backend/app/modules/portfolio/manifest.py
- backend/app/modules/postcalc/manifest.py
- backend/app/modules/prefab/manifest.py
- backend/app/modules/preliminaries/manifest.py
- backend/app/modules/price_breakdown/manifest.py
- backend/app/modules/price_index/manifest.py
- backend/app/modules/procurement/manifest.py
- backend/app/modules/procurement_concept/manifest.py
- backend/app/modules/progress/manifest.py
- backend/app/modules/project_governance/manifest.py
- backend/app/modules/project_handbook/manifest.py
- backend/app/modules/project_intelligence/manifest.py
- backend/app/modules/project_route/manifest.py
- backend/app/modules/projects/manifest.py
- backend/app/modules/property_dev/manifest.py
- backend/app/modules/punchlist/manifest.py
- backend/app/modules/quality_concept/manifest.py
- backend/app/modules/quote_capture/manifest.py
- backend/app/modules/rate_feedback/manifest.py
- backend/app/modules/rebar_schedule/manifest.py
- backend/app/modules/reconciliation/manifest.py
- backend/app/modules/record_publishing/manifest.py
- backend/app/modules/reporting/manifest.py
- backend/app/modules/resource_summary/manifest.py
- backend/app/modules/resources/manifest.py
- backend/app/modules/resumable_uploads/manifest.py
- backend/app/modules/retrieval/manifest.py
- backend/app/modules/review_authority/manifest.py
- backend/app/modules/rfi/manifest.py
- backend/app/modules/rfq_bidding/manifest.py
- backend/app/modules/risk/manifest.py
- backend/app/modules/rom_estimate/manifest.py
- backend/app/modules/russia_pack/manifest.py
- backend/app/modules/sa_pack/manifest.py
- backend/app/modules/safety/manifest.py
- backend/app/modules/saved_views/manifest.py
- backend/app/modules/schedule/manifest.py
- backend/app/modules/schedule_advanced/manifest.py
- backend/app/modules/scim/manifest.py
- backend/app/modules/search/manifest.py
- backend/app/modules/service/manifest.py
- backend/app/modules/service_charges/manifest.py
- backend/app/modules/signing/manifest.py
- backend/app/modules/site_inventory/manifest.py
- backend/app/modules/site_prep/manifest.py
- backend/app/modules/site_sensors/manifest.py
- backend/app/modules/site_supervision/manifest.py
- backend/app/modules/smart_views/manifest.py
- backend/app/modules/source_data/manifest.py
- backend/app/modules/staffing/manifest.py
- backend/app/modules/stakeholders/manifest.py
- backend/app/modules/subcontractors/manifest.py
- backend/app/modules/submittals/manifest.py
- backend/app/modules/takeoff/manifest.py
- backend/app/modules/tasks/manifest.py
- backend/app/modules/tax_withholding/manifest.py
- backend/app/modules/teams/manifest.py
- backend/app/modules/temporary_works/manifest.py
- backend/app/modules/tendering/manifest.py
- backend/app/modules/timeline/manifest.py
- backend/app/modules/transmittals/manifest.py
- backend/app/modules/uk_pack/manifest.py
- backend/app/modules/us_ca_pack/manifest.py
- backend/app/modules/us_pack/manifest.py
- backend/app/modules/us_tx_pack/manifest.py
- backend/app/modules/users/manifest.py
- backend/app/modules/validation/manifest.py
- backend/app/modules/value/manifest.py
- backend/app/modules/variations/manifest.py
- backend/app/modules/voice/manifest.py
- backend/app/modules/waste_factors/manifest.py
- backend/app/modules/webhook_leads/manifest.py
- backend/app/modules/win_loss/manifest.py
- backend/app/modules/wip_report/manifest.py

### CI guard fixes (same PR, follow-up pass)

Clears the five failing check jobs on PR #13 so the branch ships green:

- a11y attribute ratchet: the two rebranded logo `<img>` alt attributes now go
  through `t('app.name')` instead of a bare English literal (rendering is
  unchanged - `app.name` is "Vastukar" in every locale, the proper noun).
- architecture manifest guard: the committed manifest is regenerated with the
  generator (`scripts/generate_architecture_manifest.py`) so it mirrors the
  rebranded `author` field in all 234 module manifests. The page shows what
  the tree actually holds.
- authors-guard: this repository is the Vastukar downstream, so the
  first-party set gains its owner (`taha-aalam` login, `taha.aalam@gmail.com`)
  beside the upstream identities. Upstream policy itself is untouched.
- Dependency Review: repo setting - vulnerability alerts / dependency graph
  enabled for the repository (no code change).
- CodeQL: fixes the three alerts the PR diff re-surfaced (all three pre-date
  the PR on `main`, created 2026-11-10):
  `js/remote-property-injection` in the BIM smart-view shortcuts store and the
  selection-sets store (both are Map-based now; localStorage persists an
  entries array, the old object-keyed payloads are read and migrated, and a
  crafted route-derived key can never reach an object property write),
  and `js/file-system-race`
  in the vite pdfjs-asset plugin (the directory listing is read once with
  dirent types instead of an existsSync/statSync pre-check followed by a
  separate read).

Files changed in this step:

- .github/workflows/authors-guard.yml
- backend/app/modules/{bi_dashboards,commissioning,drawing_compare,plan_room,
  project_controls,qms,requirements,site_logistics,supplier_catalogs,uploads}/manifest.py
  (10 manifests whose author string differed - now also Vastukar)
- frontend/src/features/architecture/architecture_manifest.json (regenerated)
- frontend/src/features/bim/useSmartViewShortcuts.ts
- frontend/src/features/dashboard/DashboardPage.tsx (alt through t('app.name'))
- frontend/src/features/modules/RequestCustomModuleDialog.tsx (alt through t('app.name'))
- frontend/src/shared/ui/BIMViewer/SelectionSetsStore.ts
- frontend/vite.config.ts


## Divergences — upstream-facing surface removal + India default market

Removes the upstream-facing surfaces the owner called out, and makes India the
default market. Display removal only: backend endpoints, functional version
strings (API / data-format / package versions), detection logic and the
licence/attribution files are untouched. The accompanying report-only audit of
every remaining outward pointer is posted on the pull request.

Full audit document (Part 2): [docs/upstream-pointer-audit.md](docs/upstream-pointer-audit.md).

What changed:

1. Sidebar: removed the GitHub and Community (Telegram) footer entries, the
   "+ Add module" developer-guide tile and the "Request a custom module" tile.
   The developer-guide page stays (it has other entry points); the
   RequestCustomModuleDialog was removed because the sidebar tile was its only
   entry point. The footer show/hide prefs lost their github/community items.
2. Support Us: removed SupportUsButton and its "Help Vastukar grow" modal, the
   ReviewPromptCard (same star/review surface) and the useReviewPromptStore
   that only they consumed, plus every mount point (Header, AppLayout).
3. Version / update UI: removed UpdateChecker (sidebar card + badge, Settings
   and About inline notices, About "Check for updates"), the About and
   ClassicAuth version lines, the dashboard "Welcome to v…" dialog and the
   dashboard API-status version detail, and the WhatsNewCard release banner.
   The backend /api/system/version-check endpoint is left in place.
4. Logo click: the sidebar brand/wordmark now navigates client-side to the home
   route ("/") instead of opening vastukar.com. Login/register wordmarks were
   already non-linked.
5. Default market: a first run with no stored preference and no detected
   country now defaults to India (country "in", the India preset, HI_MUMBAI
   cost base, govt-building-delhi demo) instead of the United States. Changed
   DEFAULT_COUNTRY_PACK, LANG_TO_REGION.en, the getSuggestedRegion fallback,
   the suggestDataSetup locale guess, LANG_TO_DEMO.en / DEFAULT_DEMO, and the
   dashboard cases-card no-answer fallback. Detection (browser region, chosen
   language's country, applied pack) and explicit choices still outrank it.

Locale rule: every removed key was dropped from ALL 45 bundles in
frontend/src/app/locales/ (regional variants carry only diffs, so per-file
counts differ). The whatsnew.* keyspace was deliberately KEPT: it is pinned by
profileMenuClaims.test.ts and its banner is gone, so the keys are inert. Two
stale allowlist entries (update.installer_size, update.method_pip) were removed
from scripts/i18n_leak_allowlist.json.

Removed locale keys (116), by namespace:

- `about.*` (7): `about.check_updates`, `about.check_updates_available`, `about.check_updates_checking`, `about.check_updates_current`, `about.check_updates_disabled`, `about.check_updates_failed`, `about.check_updates_hint`
- `dashboard.*` (4): `dashboard.update_continue`, `dashboard.update_rerun_setup`, `dashboard.update_welcome_body`, `dashboard.update_welcome_title`
- `modules.*` (24): `modules.request_card_community_body`, `modules.request_card_community_bullet1`, `modules.request_card_community_bullet2`, `modules.request_card_community_bullet3`, `modules.request_card_community_cta`, `modules.request_card_community_tag`, `modules.request_card_community_title`, `modules.request_card_private_body`, `modules.request_card_private_bullet1`, `modules.request_card_private_bullet2`, `modules.request_card_private_bullet3`, `modules.request_card_private_cta`, `modules.request_card_private_tag`, `modules.request_card_private_title`, `modules.request_chip_analytics`, `modules.request_chip_data`, `modules.request_chip_integration`, `modules.request_chip_tools`, `modules.request_examples_label`, `modules.request_eyebrow`, `modules.request_footer_diy`, `modules.request_footer_diy_cta`, `modules.request_hero_subtitle`, `modules.request_hero_title`
- `nav.*` (4): `nav.add_module`, `nav.add_module_hint`, `nav.request_custom_module`, `nav.request_custom_module_hint`
- `review_ask.*` (9): `review_ask.aria_label`, `review_ask.body`, `review_ask.g2`, `review_ask.github`, `review_ask.later`, `review_ask.linkedin`, `review_ask.never`, `review_ask.title`, `review_ask.x`
- `settings.*` (1): `settings.update_available_inline`
- `sidebar.*` (4): `sidebar.community_title`, `sidebar.github_repo`, `sidebar.join_telegram`, `sidebar.telegram_community`
- `support.*` (27): `support.action_case_study_body`, `support.action_case_study_tag`, `support.action_case_study_title`, `support.action_donate_body`, `support.action_donate_title`, `support.action_review_body`, `support.action_review_tag`, `support.action_review_title`, `support.action_share_body`, `support.action_share_title`, `support.action_star_body`, `support.action_star_title`, `support.button_aria`, `support.button_label`, `support.button_tooltip`, `support.donate_github`, `support.donate_paypal`, `support.donate_perk_line`, `support.inside_track_link`, `support.modal_subtitle`, `support.modal_title`, `support.see_contributors`, `support.share_copied`, `support.share_copy`, `support.share_linkedin`, `support.share_twitter`, `support.thanks`
- `update.*` (36): `update.apply_now`, `update.apply_now_button`, `update.changes_count`, `update.changes_count_short`, `update.currently_on`, `update.details`, `update.download_installer`, `update.download_installer_hint`, `update.error`, `update.error_hint`, `update.got_it`, `update.group_fixed`, `update.group_new`, `update.group_polished`, `update.how_to_update`, `update.installed`, `update.installer_size`, `update.method_installer`, `update.method_installer_advice`, `update.method_pip`, `update.method_pip_sub`, `update.method_source`, `update.method_source_sub`, `update.more_count`, `update.new_available`, `update.one_click_sub`, `update.one_click_title`, `update.open_details`, `update.open_release_page`, `update.popup_title`, `update.release_notes`, `update.running`, `update.runtime_blocked_demo`, `update.runtime_blocked_disabled`, `update.show_log`, `update.whats_new`

Files changed in this step:

- DOWNSTREAM.md
- frontend/src/app/App.tsx (comment only)
- frontend/src/app/layout/AppLayout.tsx
- frontend/src/app/layout/CustomBranding.tsx
- frontend/src/app/layout/Header.tsx
- frontend/src/app/layout/Sidebar.tsx
- frontend/src/app/layout/Sidebar.footer.test.tsx
- frontend/src/app/layout/Sidebar.learn.test.tsx
- frontend/src/app/layout/Sidebar.menuModes.test.tsx
- frontend/src/app/layout/Sidebar.packMenu.test.tsx
- frontend/src/app/layout/Sidebar.pinned.test.tsx
- frontend/src/app/layout/Sidebar.quantityRules.test.tsx
- frontend/src/app/layout/Sidebar.workspace.test.tsx
- frontend/src/features/about/AboutPage.tsx
- frontend/src/features/auth/ClassicAuth.tsx
- frontend/src/features/dashboard/DashboardMarketCasesCard.tsx
- frontend/src/features/dashboard/DashboardPage.tsx
- frontend/src/features/onboarding/OnboardingWizard.tsx
- frontend/src/features/onboarding/__tests__/StepFinish.workspace.test.tsx
- frontend/src/features/onboarding/__tests__/browserRegionDefaults.test.ts
- frontend/src/features/onboarding/__tests__/countryOffer.test.ts
- frontend/src/features/onboarding/countryOffer.ts (comment only)
- frontend/src/features/onboarding/countryPacks.ts
- frontend/src/features/settings/SettingsPage.tsx
- frontend/src/features/settings/SidebarFooterCard.tsx
- frontend/src/shared/lib/footerPrefs.ts
- frontend/src/shared/ui/HeaderNewsButton.tsx (comment only)
- frontend/src/shared/ui/ProductTour.tsx (comment only)
- scripts/i18n_leak_allowlist.json
- frontend/src/app/locales/{ar,bg,bn,cs,da,de,el,en-US,en,es-CL,es-CO,es-MX,es,
  et,fa,fi,fil,fr,he,hi,hr,hu,id,it,ja,kk,ko,ky,mn,nl,no,pl,pt-BR,pt,ro,ru,sv,
  th,tr,uk,ur,uz,vi,zh}.ts (45 bundles; en-GB.ts carried none of the keys)

Files deleted in this step:

- frontend/src/app/layout/SupportUsButton.tsx
- frontend/src/app/layout/SupportUsButton.test.tsx
- frontend/src/features/modules/RequestCustomModuleDialog.tsx
- frontend/src/features/modules/__tests__/RequestCustomModuleDialog.test.tsx
- frontend/src/shared/ui/ReviewPromptCard.tsx
- frontend/src/shared/ui/ReviewPromptCard.test.tsx
- frontend/src/shared/ui/UpdateChecker.tsx
- frontend/src/shared/ui/WhatsNewCard.tsx
- frontend/src/shared/ui/__tests__/checkForUpdatesButton.test.tsx
- frontend/src/shared/ui/__tests__/updateBadge.test.tsx
- frontend/src/shared/ui/__tests__/updateNotice.test.tsx
- frontend/src/shared/ui/__tests__/whatsNewCardDismiss.test.tsx
- frontend/src/stores/useReviewPromptStore.ts
- frontend/src/stores/useReviewPromptStore.test.ts

## Divergences — owner decisions from the upstream-pointer audit (TOP 1–3)

Implements the three highest-attention owner decisions in
`docs/upstream-pointer-audit.md`. Behaviour and destinations only: package
names, import paths, API routes, database names, environment variables and the
licence/attribution files are unchanged.

### FIX 1 — Report a Bug: trim the address tail

`buildBugReportUrl` now strips everything from `?` or `#` onward from both URLs
it writes into the public issue body (the `Page` line and the `Error page`
line). The path itself stays. The user agent, app version, component, UI locale,
build fingerprint, captured-at and the already-anonymized error text are
untouched, as is the GitHub channel itself.

Files changed:

- frontend/src/app/layout/Header.tsx
- frontend/src/app/layout/BugReportMenu.test.tsx (new case: `?token=…&id=…#frag`
  on both the current page and the captured error; asserts no query key, value
  or fragment survives anywhere in the body)

### FIX 2 — Upgrade channel: own GitHub releases instead of upstream PyPI

Version check (`GET /api/system/version-check`) now reads only the latest
release of `Taha-Aalam/Vastukar`; the PyPI lookup for the upstream package is
gone. The 24-hour cache, `force=true`, the opt-out and the admin state are
unchanged. Apply-update (`POST /api/system/upgrade`) and `openconstructionerp
upgrade` now download the wheel attached to that release, verify its checksum
and install the downloaded file with the same interpreter. Every existing gate
is unchanged: admin role, `ALLOW_RUNTIME_UPGRADE` off by default, demo-account
refusal, frozen-build refusal and the embedded-PostgreSQL guard on forced
reinstalls.

Checksum mechanism: the release workflow attaches `SHA256SUMS.txt` in
`sha256sum` format; the installer downloads that manifest from the same release,
matches the wheel's filename, and compares SHA-256 before pip is invoked. If no
manifest is published it falls back to GitHub's per-asset `sha256:` digest, and
if neither exists it installs unverified. A mismatch aborts before pip starts.

Release side: `release.yml` builds the frontend, builds the backend wheel on the
tag, writes `SHA256SUMS.txt` and attaches both to the GitHub Release.
`pypi-publish.yml` is retired (dispatch-only notice, no publish job, no PyPI
environment or token); the filename is kept because repository tests reference
it. No release or tag was cut in this change.

Files changed:

- backend/app/core/release_install.py (new)
- backend/app/core/self_upgrade.py
- backend/app/main.py
- backend/app/cli.py
- backend/app/modules/costs/router.py
- backend/tests/pg/test_version_check_release_metadata.py
- backend/tests/unit/test_upgrade_path_has_no_pypi_reference.py (new)
- backend/tests/unit/test_operator_hints_reach_the_desktop_reader.py
- backend/tests/integration/test_system_upgrade_auth.py
- .github/workflows/release.yml
- .github/workflows/pypi-publish.yml

### FIX 3 — Desktop shell: Vastukar brand and own release/support destinations

Destination substitutions (old → new):

- `datadrivenconstruction/OpenConstructionERP` → `Taha-Aalam/Vastukar`
  (update checker repo constant, API URL by interpolation, release URLs, notice
  text and test payloads).
- `OpenConstructionERP-Desktop` → `Vastukar-Desktop` (update-check UA token).
- `info@datadrivenconstruction.io` → `info@vastukar.com` (startup-failure and
  help dialogs plus their tests).
- `https://openconstructionerp.com/install-help` → `https://vastukar.com/contact`
  (startup-failure and help dialogs, desktop README, and their tests).
- Product name in window title, tray tooltip, installer strings, binary
  metadata and user-visible dialog/log strings → `Vastukar`.

`desktop/src-tauri/tauri.conf.json`: `productName` → `Vastukar`,
`identifier` → `io.vastukar.desktop`, `mainBinaryName` → `Vastukar`, window
title and tray tooltip → `Vastukar`, publisher/copyright/description strings →
Vastukar. **Identifier migration flag:** changing `io.openconstructionerp.desktop`
to `io.vastukar.desktop` changes the OS-level app identity. Windows treats the
new value as a different app (separate install, Start-menu entry and registry
tree), and macOS treats it as a different bundle id, so existing installs do
not upgrade in place; the owner needs a migration/uninstall note for existing
users. A Tauri build rewrites `gen/schemas/capabilities.json`; that generated
file was not hand-edited here.

The frontend desktop bridge (`frontend/src/shared/lib/desktop.ts`,
`frontend/src/features/file-manager/lib/tauri.ts`) has no upstream destination
or name outside the excluded `DDC-CWICR-OE` code-comment headers, so it was not
changed and web-app behaviour is unchanged. Internal filesystem identifiers
(`%LOCALAPPDATA%\OpenConstructionERP\extract`, `/etc/openconstructionerp`,
`openconstructionerp-server` sidecar name, CLI command names) are unchanged by
the standing rule.

Branding assets: `desktop/src-tauri/icons/` already carries the Vastukar-style
blue bar-chart mark with no upstream wordmark, and the flat source PNG exists at
`frontend/public/brand/vastukar-logo.png`; no binary artwork was changed here.
For a pixel-exact match the owner must regenerate the whole set from that source
(`32x32.png`, `64x64.png`, `128x128.png`, `128x128@2x.png`, `icon.png`,
`icon.ico`, `icon.icns`, the Square*/Store logos, and the ios/android trees).

Signing (report only, no credentials touched): `desktop-release.yml` references
`ARTIFACT_SIGNING_ENDPOINT`, `ARTIFACT_SIGNING_ACCOUNT`,
`ARTIFACT_SIGNING_PROFILE`, `ARTIFACT_SIGNING_TENANT_ID`,
`ARTIFACT_SIGNING_CLIENT_ID` and `ARTIFACT_SIGNING_CLIENT_SECRET` (an Azure
Trusted Signing / code-signing account), and macOS currently uses ad-hoc
signing with `signingIdentity: "-"`. `release-signing.yml` uses Sigstore/cosign
keyless OIDC and its verification snippet still names the upstream repo. Before
a signed Vastukar installer can ship, the owner must obtain their own signing
credentials/identity and update those references; none were invented or
imported here.

Files changed:

- desktop/src-tauri/tauri.conf.json
- desktop/src-tauri/Cargo.toml
- desktop/src-tauri/src/update_check.rs
- desktop/src-tauri/src/main.rs
- desktop/src-tauri/src/server_config.rs
- desktop/src-tauri/capabilities/default.json
- desktop/src-tauri/windows/hooks.nsh
- desktop/src-tauri/windows/installer.nsi
- desktop/README.md
- desktop/build-sidecar.sh
- desktop/pyinstaller.spec
- DOWNSTREAM.md
