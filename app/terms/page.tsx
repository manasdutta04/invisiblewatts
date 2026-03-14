"use client"

import Link from "next/link"
import Layout from "@/components/kokonutui/layout"

export default function TermsPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Terms of Service</h1>
        <p className="text-gray-600 dark:text-gray-400">Last updated: March 2025 · InvisibleWatts is currently in public beta.</p>
      </div>

      <div className="space-y-8 max-w-none dark:text-gray-300">

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            By accessing or using InvisibleWatts (the "Service"), you agree to be bound by these Terms of Service.
            If you do not agree, do not use the Service. These terms apply to all visitors, users, and others who
            access or use InvisibleWatts, including the web application and the optional Chrome extension.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Beta Status</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            InvisibleWatts is currently offered as a free public beta. Features may be incomplete, changed, or
            removed at any time without notice. We make no guarantees about uptime, data retention, or feature
            availability during the beta period. By using the Service you acknowledge and accept this.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Description of Service</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            InvisibleWatts allows users to upload screenshots of device screen time reports (iOS Screen Time,
            Android Digital Wellbeing, Windows) or manually enter device usage data. The Service uses AI (advanced AI analysis)
            to extract usage information from screenshots and to estimate CO₂ emissions from digital activity.
            The Service provides:
          </p>
          <ul className="text-gray-600 dark:text-gray-400 space-y-2 list-disc list-inside">
            <li>AI-powered extraction of usage data from uploaded screenshots</li>
            <li>Estimated CO₂ emissions calculated from device type, daily hours, and activity type</li>
            <li>Personalised recommendations to reduce digital carbon footprint</li>
            <li>Dashboard, analytics, and reporting tools built from your uploaded data</li>
            <li>An optional Chrome extension for real-time per-site carbon estimation</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. AI Estimates Disclaimer</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            CO₂ emission estimates produced by InvisibleWatts are approximations based on global average grid
            emission factors and typical device power consumption figures. They are intended as directional
            indicators to help you understand trends in your digital carbon footprint, not as precise scientific
            measurements. Actual emissions vary by geographic region, device model, network type, and data centre
            efficiency. InvisibleWatts makes no warranty as to the accuracy, completeness, or fitness for any
            particular purpose of these estimates.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Data & Privacy</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            We take your privacy seriously. In particular:
          </p>
          <ul className="text-gray-600 dark:text-gray-400 space-y-2 list-disc list-inside">
            <li>
              <strong className="text-gray-800 dark:text-gray-200">Uploaded images are never stored.</strong>{" "}
              Screenshots are read locally in your browser, converted to base64, and sent to the AI extraction API.
              Only the extracted text data (device type, hours, activity) is saved to the database.
            </li>
            <li>
              All data is stored in a Supabase database with row-level security — you can only access your own data.
            </li>
            <li>
              We do not sell, share, or use your personal usage data for advertising or third-party analytics.
            </li>
            <li>
              You may delete your account and all associated data at any time from Settings → Danger Zone.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. User Accounts</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            You are responsible for maintaining the confidentiality of your account credentials and for all
            activity that occurs under your account. You must notify us immediately of any unauthorised use of
            your account by raising an issue on{" "}
            <Link
              href="https://github.com/manasdutta04/invisiblewatts/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              GitHub
            </Link>
            . You may not create accounts using automated means or under false pretences.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Acceptable Use</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            You agree not to:
          </p>
          <ul className="text-gray-600 dark:text-gray-400 space-y-2 list-disc list-inside">
            <li>Upload content that contains malware, exploits, or harmful code</li>
            <li>Attempt to reverse engineer, scrape, or systematically extract data from the Service</li>
            <li>Use the Service to harass, impersonate, or harm other users</li>
            <li>Circumvent or attempt to bypass authentication or security controls</li>
            <li>Use automated scripts to access the Service in a manner that places excessive load on infrastructure</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Intellectual Property</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            The InvisibleWatts source code is open source and available under the MIT License on{" "}
            <Link
              href="https://github.com/manasdutta04/invisiblewatts"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              GitHub
            </Link>
            . The InvisibleWatts name, logo, and brand assets remain the property of the project contributors.
            Your usage data belongs to you.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Disclaimer of Warranties</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            The Service is provided on an "as is" and "as available" basis without warranties of any kind, either
            express or implied, including but not limited to implied warranties of merchantability, fitness for a
            particular purpose, or non-infringement. InvisibleWatts does not warrant that the Service will be
            uninterrupted, error-free, or that any defects will be corrected.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Limitation of Liability</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            To the fullest extent permitted by law, InvisibleWatts and its contributors shall not be liable for
            any indirect, incidental, special, consequential, or punitive damages, including loss of data or
            profits, arising from your use of or inability to use the Service — even if advised of the possibility
            of such damage.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">11. Modifications to Terms</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            We reserve the right to update these Terms at any time. Material changes will be announced via the
            GitHub repository. Continued use of the Service after changes are posted constitutes acceptance of
            the revised Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">12. Governing Law</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            These Terms are governed by applicable law. Any disputes arising from your use of the Service shall
            be resolved in accordance with the laws of the jurisdiction where the project is maintained.
          </p>
        </section>

        <section className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Questions?</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            If you have any questions about these Terms of Service, please{" "}
            <Link
              href="https://github.com/manasdutta04/invisiblewatts/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              raise an issue on GitHub
            </Link>
            .
          </p>
        </section>

      </div>
      </div>
    </Layout>
  )
}
