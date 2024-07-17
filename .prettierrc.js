module.exports = {
    printWidth: 80, //單行長度
    tabWidth: 2, //縮排長度
    useTabs: false, //使用空格代替tab縮排
    semi: true, //句末使用分號
    singleQuote: true, //使用單引號
    quoteProps: 'as-needed', //僅在必需時為物件的key加上引號
    jsxSingleQuote: true, // jsx中使用單引號
    trailingComma: 'all', //多行時盡可能列印尾隨逗號
    bracketSpacing: true, //在物件前後加上空格-eg: { foo: bar }
    jsxBracketSameLine: true, //多屬性html標籤的‘>’折行放置
    arrowParens: 'always', //單參數箭頭函數參數周圍使用圓括號-eg: (x) => x
    requirePragma: false, //無需頂部註解即可格式化
    insertPragma: false, //在已被preitter格式化的檔案頂部加上標註
    proseWrap: 'preserve', //不知道怎麼翻譯
    htmlWhitespaceSensitivity: 'ignore', //對HTML全域空白不敏感
    endOfLine: 'lf', //結束行形式
    embeddedLanguageFormatting: 'auto', //對引用程式碼進行格式化
};