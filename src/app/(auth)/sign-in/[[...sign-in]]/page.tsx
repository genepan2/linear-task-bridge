import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Task Bridge
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Sign in to access your projects
        </p>
      </div>

      <SignIn
        appearance={{
          elements: {
            formButtonPrimary:
              'bg-blue-600 hover:bg-blue-700 text-sm normal-case',
            card: 'shadow-xl',
            headerTitle: 'hidden',
            headerSubtitle: 'hidden',
            socialButtonsBlockButton:
              'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800',
            formFieldInput:
              'border-gray-300 dark:border-gray-600 focus:ring-blue-500',
            footerActionLink:
              'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300',
          },
        }}
      />
    </div>
  )
}
