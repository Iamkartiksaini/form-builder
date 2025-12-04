import React from 'react'
import { cn } from '../utils/tw-merge'

export default function MainContainer({ children, className = "" }: { children: React.ReactNode | React.ReactNode[], className?: string }) {
    return (
        <div className={cn("max-w-4xl mx-auto p-6 bg-white rounded-md shadow-md", className)}>
            {children}
        </div>
    )
}
