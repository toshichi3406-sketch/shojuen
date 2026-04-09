"use client"

import { motion, type HTMLMotionProps } from "framer-motion"

const ease = [0.22, 1, 0.36, 1] as const

export function FadeIn({
  children,
  className,
  delay = 0,
  y = 28,
  ...rest
}: HTMLMotionProps<"div"> & {
  delay?: number
  y?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px -8% 0px" }}
      transition={{ duration: 0.75, delay, ease }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

export function FadeInStagger({
  children,
  className,
  stagger = 0.08,
}: {
  children: React.ReactNode
  className?: string
  stagger?: number
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: stagger, delayChildren: 0.05 },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function FadeInItem({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 22 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.65, ease },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
