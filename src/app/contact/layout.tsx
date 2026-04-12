import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "CONTACT · お問い合わせ",
  description: "松壽園SHOJUENへのお問い合わせ（info@ochanoshojuen.com）。",
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
