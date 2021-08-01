import { scan } from "./LexParser.js";

let syntax = {
  Program: [["Statement", "EOF"]],
  StatementList: [["StatementList", "Statement"]],
  Statement: [
    ["ExpressionStatement"],
    ["IfStatemnt"],
    ["VariableDeclaration"],
    ["FunctionDeclaration"],
  ],
  IfStatemnt: [["if", "(", "Expression", ")", "Statement"]],
  VariableDeclaration: [
    ["var", "Identifier", ";"],
    ["let", "Identifier", ";"],
  ],
  FunctionDeclaration: [
    ["function", "Identifier", "(", ")", "{", "StatementList", "}"],
  ],
  ExpressionStatement: [["Expression", ";"]],
  Expression: [["AdditiveExpression"]],
  AdditiveExpression: [
    ["MulitplicativeExpression"],
    ["AdditiveExpression", "+", "AdditiveExpression"],
    ["AdditiveExpression", "-", "AdditiveExpression"],
  ],
  MulitplicativeExpression: [
    ["PrimaryExpression"],
    ["MulitplicativeExpression", "*", "PrimaryExpression"],
    ["MulitplicativeExpression", "/", "PrimaryExpression"],
  ],
  PrimaryExpression: [["(", "Expression", ")"], ["Literal"], ["Identifier"]],
  Literal: [
    ["Number"],
    ["String"],
    ["Boolean"],
    ["Null"],
    ["RegularExpression"],
  ],
};

let hash = {};

function closure(state) {
  hash[JSON.stringify(state)] = state;
  let queue = [];
  for (let symbol in state) {
    if (symbol.match(/^$/)) {
      return;
    }
    queue.push(symbol);
  }
  while (queue.length) {
    let symbol = queue.shift();

    // console.log(symbol);
    if (syntax[symbol]) {
      for (let rule of syntax[symbol]) {
        if (!state[rule[0]]) {
          queue.push(rule[0]);
        }
        let current = state;
        for (let part of rule) {
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part];
        }
        current.$reduceType = symbol;
        current.$redueceLength = rule.length;
      }
    }
  }
  for (let symbol in state) {
    if (symbol.match(/^\$/)) {
      return;
    }
    if (hash[JSON.stringify(state[symbol])]) {
      state[symbol] = hash[JSON.stringify(state[symbol])];
    } else {
      closure(state[symbol]);
    }
  }
}

let end = {
  $isEnd: true,
};

let start = {
  Program: end,
};

closure(start);

function parse(source) {
  let stack = [start];
  let symbolStack = [];

  function reduce() {
    let state = stack[stack.length - 1];

    if (state.$reduceType) {
      let children = [];
      for (let i = 0; i < state.$redueceLength; i++) {
        stack.pop();
        children.push(symbolStack.pop());
      }
      // create a non-terminal symbol and shift it
      return {
        type: state.$reduceType,
        children: children.reverse(),
      };
    } else {
      throw new Error("unexpected token");
    }
  }

  function shift(symbol) {
    let state = stack[stack.length - 1];
    if (symbol.type in state) {
      stack.push(state[symbol.type]);
      symbolStack.push(symbol);
    } else {
      // reduce non-terminal symbol
      shift(reduce());
      shift(symbol);
    }
  }

  // termnial symbol
  for (let symbol of scan(source)) {
    shift(symbol);
  }

  //   console.log(reduce());
  return reduce();
}

let evaluator = {
  Program(node) {
    return evaluate(node.children[0]);
  },
  StatementList() {
    if (node.children.length === 1) {
      return evaluate(node.children[0]);
    } else {
      evaluate(node.children[0]);
      return evaluate(node.children[1]);
    }
  },
  Statement(node) {
    return evaluate(node.children[0]);
  },
  VariableDeclaration(node) {
    console.log("Declare variable ", node.children[1].name);
  },
  EOF() {
    return null;
  },
};

function evaluate(node) {
  if (evaluator[node.tpye]) {
    return evaluator[node.type](node);
  }
}

/////////////////////////////////////////

let source = `
    var a;
`;

let tree = parse(source);

evaluate(tree);
