import type { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  style?: string;
}

const Container = ({children, style = ""}: ContainerProps) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-violet-100 via-purple-100 to-violet-200 dark:from-gray-900 dark:via-violet-950 dark:to-purple-950 ${style}`}>
      {children}
    </div>
  )
}

export default Container