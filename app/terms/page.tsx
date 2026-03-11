export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Terms of Service</h1>
        <p className="text-gray-600 dark:text-gray-400">Last updated: March 2025</p>
      </div>

      <div className="space-y-8 prose prose-invert max-w-none dark:text-gray-300">
        {/* Section 1 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            By accessing and using the InvisibleWatts service (the "Service"), you accept and agree to be bound by
            the terms and provision of this agreement. If you do not agree to abide by the above, please do not use
            this service.
          </p>
        </section>

        {/* Section 2 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Use License</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            Permission is granted to temporarily download one copy of the materials (information or software) on
            InvisibleWatts's web and mobile applications for personal, non-commercial transitory viewing only. This
            is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="text-gray-600 dark:text-gray-400 space-y-2">
            <li>Modifying or copying the materials</li>
            <li>Using the materials for any commercial purpose or for any public display</li>
            <li>Attempting to decompile or reverse engineer any software contained on the Service</li>
            <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
            <li>Removing any copyright or other proprietary notations from the materials</li>
            <li>Transmitting or receiving data through the Service that contains a virus or other harmful component</li>
            <li>Engaging in any conduct that restricts or inhibits anyone's use or enjoyment of the Service</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Disclaimer</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            The materials on InvisibleWatts's web and mobile applications are provided on an 'as is' basis.
            InvisibleWatts makes no warranties, expressed or implied, and hereby disclaims and negates all other
            warranties including, without limitation, implied warranties or conditions of merchantability, fitness
            for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
        </section>

        {/* Section 4 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Limitations</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            In no event shall InvisibleWatts or its suppliers be liable for any damages (including, without
            limitation, damages for loss of data or profit, or due to business interruption) arising out of the use
            or inability to use the materials on InvisibleWatts's web and mobile applications, even if InvisibleWatts
            or an authorized representative has been notified orally or in writing of the possibility of such damage.
          </p>
        </section>

        {/* Section 5 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Accuracy of Materials</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            The materials appearing on InvisibleWatts's web and mobile applications could include technical,
            typographical, or photographic errors. InvisibleWatts does not warrant that any of the materials on its
            Service are accurate, complete, or current. InvisibleWatts may make changes to the materials contained on
            its Service at any time without notice.
          </p>
        </section>

        {/* Section 6 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Links</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            InvisibleWatts has not reviewed all of the sites linked to its web and mobile applications and is not
            responsible for the contents of any such linked site. The inclusion of any link does not imply
            endorsement by InvisibleWatts of the site. Use of any such linked website is at the user's own risk.
          </p>
        </section>

        {/* Section 7 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Modifications</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            InvisibleWatts may revise these terms of service for its web and mobile applications at any time without
            notice. By using this service, you are agreeing to be bound by the then current version of these terms of
            service.
          </p>
        </section>

        {/* Section 8 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Governing Law</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction
            where InvisibleWatts is located, and you irrevocably submit to the exclusive jurisdiction of the courts
            in that location.
          </p>
        </section>

        {/* Section 9 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. User Accounts</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
            If you create an account on the Service, you are responsible for maintaining the confidentiality of your
            account information and password and for restricting access to your computer. You agree to accept
            responsibility for all activities that occur under your account or password. You must notify us
            immediately of any unauthorized uses of your account.
          </p>
        </section>

        {/* Section 10 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Data and Privacy</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Your use of the Service is also governed by our Privacy Policy. Please review our Privacy Policy to
            understand our practices regarding the collection and use of your personal information and other data.
          </p>
        </section>

        {/* Contact Section */}
        <section className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Questions?</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            If you have any questions about these Terms of Service, please contact us at{" "}
            <a
              href="mailto:legal@invisiblewatts.com"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              legal@invisiblewatts.com
            </a>
          </p>
        </section>
      </div>
    </div>
  )
}
