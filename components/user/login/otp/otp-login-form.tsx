"use client"

import * as React from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { CircleIcon, CrossCircledIcon } from "@radix-ui/react-icons"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { signInWithOtp } from "@/modules/user/auth"

export const OtpLoginForm: React.FC<{
  error?: { message: string; status: number }
}> = ({ error }) => {
  const signIn = useMutation({
    mutationFn: signInWithOtp,
  })

  function handleSignIn({ email }: { email: string }): void {
    signIn.mutate({
      email,
      options: {
        shouldCreateUser: false,
      },
      redirect: {
        url: `/login/otp/confirm?email=${email}`,
      },
    })
  }

  return (
    <OtpLoginFormComponent
      signIn={handleSignIn}
      isPending={signIn.isPending}
      isError={!!signIn.data?.error || !!error}
      errorMessage={signIn.data?.error.message || error?.message}
    />
  )
}

const FormSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
})

const OtpLoginFormComponent: React.FC<{
  signIn: ({ email }: { email: string }) => void
  isPending: boolean
  isError: boolean
  errorMessage?: string
}> = ({ signIn, isPending, isError, errorMessage }) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
    },
  })

  return (
    <Card className="mx-auto my-16 max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">One-Time password login</CardTitle>
        <CardDescription>
          Use OTP login to sign in using your email
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(({ email }) => signIn({ email }))}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="sosa@webscope.io" {...field} />
                  </FormControl>
                  <FormDescription>
                    Please enter the email associated with your account
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isError && (
              <Alert variant="destructive">
                <CrossCircledIcon className="size-4" />
                <AlertTitle>Something went wrong!</AlertTitle>
                <AlertDescription>
                  {errorMessage ?? "Unknown error"}
                </AlertDescription>
              </Alert>
            )}
            <footer className="flex flex-col gap-3">
              <Button type="submit" disabled={isPending}>
                {isPending && (
                  <CircleIcon className="mr-2 size-4 animate-spin" />
                )}
                Email me a One-Time password
              </Button>
              <Button asChild variant="link">
                <Link href="/login">Back to Login</Link>
              </Button>
            </footer>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
