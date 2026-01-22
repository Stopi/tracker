import {useState} from "react"
import {useNavigate} from "react-router"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {z} from "zod"
import {toast} from "sonner"
import {api} from "@/lib/api.tsx";
import {loginSchema} from "shared/dist/validators"
import {Button} from "@/components/ui/button"
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form"
import {Input} from "@/components/ui/input"
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card"
import {useTheme} from "@/components/theme/useTheme.tsx";
import {useAuth} from "@/components/auth/useAuth.tsx";

type LoginFormValues = z.infer<typeof loginSchema>

/**
 * Login form component that authenticates users via session API.
 * On success, initializes auth state, applies stored theme, and redirects home.
 */
function Login() {
  const { login } = useAuth()
  const { setThemeState } = useTheme()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  /** Handles form submission: authenticates user and initializes app state */
  async function onSubmit(formData: LoginFormValues) {
    setIsLoading(true)
    setError(null)

    try {
      const res = await api.session.$post({
        json: {
          username: formData.username,
          password: formData.password,
        },
      })

      if (!res.ok) {
        // Display server-provided error or fallback message
        const errorData = await res.json();
        const message = (errorData as { message?: string }).message || "Invalid username or password"
        setError(message)
        toast.error(message)
        return
      }

      const data = await res.json();
      // Initialize authenticated session state
      login(data.user)
      // Apply user's preferred theme before rendering protected routes
      setThemeState(data.darkTheme)
      toast.success("Welcome back!")
      navigate("/", { replace: true })
    } catch (err) {
      // Network errors or unexpected failures
      const message = "An error occurred. Please try again."
      setError(message)
      toast.error(message)
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your username and password to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your username"
                        {...field}
                        disabled={isLoading}
                        autoComplete="username"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                        disabled={isLoading}
                        autoComplete="current-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && (
                <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
