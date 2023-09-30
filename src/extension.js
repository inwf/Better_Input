const vscode = require ('vscode');
const { exec } = require('child_process');
const path = require('path');

// 执行指定的.exe脚本
function executeScript(scriptName) {
    const scriptPath = path.join(__dirname, '..', 'changeAHK', `${scriptName}.exe`);//上一级
//   const scriptPath = path.join(__dirname, 'changeAHK', `${scriptName}.exe`);
//   console.log(`脚本路径: ${scriptPath}`);
//   vscode.window.showInformationMessage (' 脚本路径: ${scriptPath}');

  exec(scriptPath, (error, stdout, stderr) => {
    if (error) {
      console.error(`执行${scriptName}.exe脚本时出错: ${error}`);
      return;
    }
    // console.log(`${scriptName}.exe脚本输出: ${stdout}`);
  });
}

// 执行toEN.exe
// executeScript('toEN');

// 执行toCN.exe
// executeScript('toCN');

let isInCommentArea = false; // 初始化时不在注释区

function activate (context) {
    // 在插件激活时执行的初始化代码
    console.log ('Better Input plugin activated');

    // 监听光标位置变化事件
    vscode.window.onDidChangeTextEditorSelection (event => {
        const editor = event.textEditor;
        if (!editor) {
            // vscode.window.showErrorMessage ('No active text editor.');
            return;
        }

        const currentPosition = editor.selection.active;

        // 检查当前光标位置
        const isInComment = isInsideComment (editor, currentPosition);

        if (isInComment && !isInCommentArea) {
            // vscode.window.showInformationMessage (' 从代码区进入注释区域。');
            executeScript("toCN");
            isInCommentArea = true;
        } else if (!isInComment && isInCommentArea) {
            // vscode.window.showInformationMessage (' 从注释区域进入代码区。');
            executeScript("toEN");
            isInCommentArea = false;
        }
    });

    // 初始化
    checkInit ();
}

function checkInit () {
    
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        // vscode.window.showErrorMessage ('No active text editor.');
        return;
    }

    const currentPosition = editor.selection.active;

    // 检查初始光标位置
    const isInComment = isInsideComment (editor, currentPosition);

    //if (isInComment) {
    //     vscode.window.showInformationMessage (' 初始光标在注释区域。');
    //     isInCommentArea = true;
    // } else {
    /**Written by inwf - 2023.9*/
    //     vscode.window.showInformationMessage (' 初始光标在代码区域。');
    //     isInCommentArea = false;
    // }
}

function isInsideComment (editor, position) {
    const document = editor.document;
    const line = document.lineAt (position.line);

    // 使用正则表达式检查多行注释开始和结束
    const multiLineCommentStartRegex = /\/\*\s*/;
    const multiLineCommentEndRegex = /\*\//;

    let insideMultiLineComment = false;
    let commentStart = document.getText ().indexOf ('/*');
    let commentEnd = document.getText ().indexOf ('*/', commentStart);

    while (commentStart !== -1 && commentEnd !== -1) {
        // 检查当前光标位置是否在多行注释内
        if (position.isAfterOrEqual (document.positionAt (commentStart + 2)) && position.isBeforeOrEqual (document.positionAt (commentEnd))) {
            insideMultiLineComment = true;
            break;
        }

        // 寻找下一个多行注释的开始和结束
        commentStart = document.getText ().indexOf ('/*', commentEnd);
        commentEnd = document.getText ().indexOf ('*/', commentEnd + 2);
    }

    // 使用正则表达式检查以 // 开始的单行注释
    const singleLineCommentRegex = /\/\/\s*/;

    // 检查是否为当前行的 // 注释，只在 // 后面算注释
    const lineText = line.text;
    const lineStartPosition = line.range.start;
    const lineCommentPosition = lineText.indexOf ('//');
    if (lineCommentPosition !== -1 && position.isAfterOrEqual (new vscode.Position (lineStartPosition.line, lineStartPosition.character + lineCommentPosition + 2))) {
        return true; // 在注释内
    }

    return insideMultiLineComment; // 返回光标位置是否在注释内
}

module.exports = {
    activate
};
