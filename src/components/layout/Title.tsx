const Title = ({ children, fontSize, style }) => {
  return (
    <h1 className={`${fontSize} font-bold bg-gradient-to-r from-violet-700 via-purple-600 to-fuchsia-600 dark:from-violet-400 dark:via-purple-400 dark:to-fuchsia-400 bg-clip-text text-transparent ${style}`}>
      {children}
    </h1>
  )
}

export default Title