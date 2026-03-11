import { ChevronRight } from "lucide-react"
import Link from "next/link"

const helpSections = [
  {
    title: "Getting Started",
    items: [
      {
        question: "How do I set up my energy monitoring device?",
        answer:
          "To set up your energy monitoring device, follow these steps: 1) Connect the device to your home WiFi network, 2) Download the InvisibleWatts app, 3) Create an account and log in, 4) Follow the in-app setup wizard to connect your device. For detailed instructions, visit our setup guide.",
      },
      {
        question: "What devices are compatible with InvisibleWatts?",
        answer:
          "InvisibleWatts supports a wide range of smart home devices including smart meters, HVAC systems, water heaters, and other connected appliances. Check our device compatibility list for a complete list of supported devices.",
      },
    ],
  },
  {
    title: "Using the Dashboard",
    items: [
      {
        question: "How do I interpret my energy usage data?",
        answer:
          "Your dashboard displays real-time and historical energy consumption data. The graphs show usage patterns over time, helping you identify peak usage hours and opportunities to save. Color-coded alerts highlight unusual consumption patterns.",
      },
      {
        question: "What do the AI recommendations mean?",
        answer:
          "Our AI analyzes your energy usage patterns and provides personalized recommendations to reduce consumption and lower your bills. These are based on your specific usage habits and home characteristics.",
      },
      {
        question: "How can I set energy usage goals?",
        answer:
          "Visit the Analytics page to set monthly or yearly energy usage goals. The system will track your progress and notify you when you're on track to meet your targets.",
      },
    ],
  },
  {
    title: "Troubleshooting",
    items: [
      {
        question: "My device won't connect to WiFi. What should I do?",
        answer:
          "Try these steps: 1) Restart your device, 2) Check that your WiFi signal is strong, 3) Ensure you're entering the correct password, 4) Restart your WiFi router. If issues persist, contact our support team.",
      },
      {
        question: "I'm not seeing any data on my dashboard",
        answer:
          "This might happen if your device is still syncing. Wait a few minutes and refresh the page. If data still doesn't appear, check that your device is properly connected to your account.",
      },
      {
        question: "How do I update my InvisibleWatts app?",
        answer:
          "The app typically updates automatically. You can also manually check for updates in your device's app store (Apple App Store or Google Play Store) by visiting the InvisibleWatts app page.",
      },
    ],
  },
  {
    title: "Account & Security",
    items: [
      {
        question: "How do I reset my password?",
        answer:
          "Click on 'Forgot Password' on the login page and enter your email address. We'll send you a link to reset your password. Follow the instructions in the email to create a new password.",
      },
      {
        question: "Is my data secure?",
        answer:
          "Yes, we use industry-standard encryption and security measures to protect your data. All data is transmitted over secure HTTPS connections and stored in encrypted databases.",
      },
      {
        question: "Can I delete my account?",
        answer:
          "Yes, you can delete your account from your Settings page. Note that this action is permanent and will remove all your data from our servers.",
      },
    ],
  },
]

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Help & Support</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Find answers to common questions and get support for using InvisibleWatts.
        </p>
      </div>

      <div className="space-y-8">
        {helpSections.map((section) => (
          <div key={section.title} className="border-b border-gray-200 dark:border-[#2B2B30] pb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{section.title}</h2>
            <div className="space-y-4">
              {section.items.map((item, index) => (
                <details
                  key={index}
                  className="group cursor-pointer border border-gray-200 dark:border-[#2B2B30] rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-[#1F1F23] transition-colors"
                >
                  <summary className="flex items-start justify-between font-semibold text-gray-900 dark:text-white">
                    <span className="text-left">{item.question}</span>
                    <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0 ml-4 group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Still need help?</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Can't find the answer you're looking for? Contact our support team for personalized assistance.
        </p>
        <Link
          href="mailto:support@invisiblewatts.com"
          className="inline-block px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
        >
          Email Support
        </Link>
      </div>
    </div>
  )
}
