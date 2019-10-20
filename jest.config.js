module.exports = {
    "roots": [
        "<rootDir>/app/__tests__"
    ],
    "transform": {
        "^.+\\.tsx?$": "ts-jest"
    },
    "testPathIgnorePatterns": [
        "./__utils.ts"
    ],
    globals: {
        'ts-jest': {
            diagnostics: false
        }
    }
}