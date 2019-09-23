module.exports = {
    "roots": [
        "<rootDir>/app/__tests__"
    ],
    "transform": {
        "^.+\\.tsx?$": "ts-jest"
    },
    globals: {
        'ts-jest': {
            diagnostics: false
        }
    }
}