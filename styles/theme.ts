import { ThemeType } from 'grommet'

const theme: ThemeType = {
    button: {
        default: {
            border: {
                // radius: '0px',
                color: 'brand',
            },
            background: {
                color: 'backgroundLight',
            },
            color: 'brand',
        },
        primary: {
            border: {
                // radius: '0px',
            },
            background: {
                color: '#000000',
            },
        },
        secondary: {
            border: {
                // radius: '0px',
                color: 'brand',
                width: '1px',
            },
            color: 'brand',
        },
        border: {
            radius: '0px',
        },
    },
    global: {
        font: {
            family: 'Lars',
            size: '18px',
            height: '20px',
        },
        colors: {
            backgroundDark: '#163D26',
            backgroundLight: '#FBF7F1',
            brand: '#C84414',
        },
    },
}

export default theme
