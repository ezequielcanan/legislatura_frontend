module.exports = {
  theme: {
    extend: {
      colors: {
        fuchsia: {
          strong: 'rgb(var(--fuchsia-strong) / <alpha-value>)',
          medium: 'rgb(var(--fuchsia-medium) / <alpha-value>)',
          light: 'rgb(var(--fuchsia-light) / <alpha-value>)',
        },
        red: {
          strong: 'rgb(var(--red-strong) / <alpha-value>)',
          medium: 'rgb(var(--red-medium) / <alpha-value>)',
          light: 'rgb(var(--red-light) / <alpha-value>)',
        },
        green: {
          strong: 'rgb(var(--green-strong) / <alpha-value>)',
          medium: 'rgb(var(--green-medium) / <alpha-value>)',
          light: 'rgb(var(--green-light) / <alpha-value>)',
        },
        // mismo para red y green...
      },
    },
  },
}
