import {
  ExecutionContext,
  CompletionRecord,
  Reference,
  Realm,
  JSObject,
  JSNull,
  JSNumber,
  JSSymbol,
  JSString,
  JSUndefined,
  JSBoolean,
  ObjectEnvironmentRecord,
  EnvironmentRecord,
} from "./runtime.js";

export class Evaluator {
  constructor() {
    this.realm = new Realm();
    this.globalObject = new JSObject();
    this.globalObject.set("log", new JSObject());
    this.globalObject.get("log").call = (args) => {
      console.log(args);
    };
    this.ecs = [
      new ExecutionContext(
        this.realm,
        new ObjectEnvironmentRecord(this.globalObject),
        new ObjectEnvironmentRecord(this.globalObject)
      ),
    ];
  }

  evaluate(node) {
    // console.log(node);
    if (this[node.type]) {
      return this[node.type](node);
    }
  }

  Program(node) {
    return this.evaluate(node.children[0]);
  }
  IFStatement(node) {
    let condition = this.evaluate(node.children[2]);
    if (condition instanceof Reference) {
      condition = condition.get();
    }
    if (condition.toBoolean().value) {
      return this.evaluate(node.children[4]);
    }
  }
  WhileStatement(node) {
    while (true) {
      let condition = this.evaluate(node.children[2]);
      if (condition instanceof Reference) {
        condition = condition.get();
      }
      if (condition.toBoolean().value) {
        let record = this.evaluate(node.children[4]);
        if (record.type === "continue") {
          continue;
        }
        if (record.type === "break") {
          return new CompletionRecord("normal");
        }
      } else {
        return new CompletionRecord("normal");
      }
    }
  }
  BreakStatement(node) {
    return new CompletionRecord("break");
  }
  BreakStatement(node) {
    return new CompletionRecord("continue");
  }
  StatementList() {
    if (node.children.length === 1) {
      return this.evaluate(node.children[0]);
    } else {
      let record = this.evaluate(node.children[0]);
      if (record.type === "normal") {
        return this.evaluate(node.children[1]);
      } else {
        return record;
      }
    }
  }
  Statement(node) {
    return this.evaluate(node.children[0]);
  }
  VariableDeclaration(node) {
    // console.log("Declare variable ", node.children[1].name);
    let runningEC = this.ecs[this.ecs.length - 1];
    runningEC.variableEnviroment.add(node.children[1].name);
    return new CompletionRecord("normal", new JSUndefined());
  }
  ExpressionStatement(node) {
    let result = this.evaluate(node.children[0]);
    if (result instanceof Reference) {
      result = result.get();
    }
    return new CompletionRecord("normal", result);
  }
  Expression(node) {
    return this.evaluate(node.children[0]);
  }
  AdditiveExpression(node) {
    if (node.children.length === 1) {
      return this.evaluate(node.children[0]);
    } else {
      let left = this.evaluate(node.children[0]);
      let right = this.evaluate(node.children[2]);
      if (left instanceof Reference) {
        left = left.get();
      }
      if (right instanceof Reference) {
        right = right.get();
      }
      if (node.children[1].type === "+") {
        return new JSNumber(left.value + right.value);
      }
      if (node.children[1].type === "-") {
        return new JSNumber(left.value - right.value);
      }
    }
  }
  MulitplicativeExpression(node) {
    if (node.children.length === 1) {
      return this.evaluate(node.children[0]);
    } else {
      // TODO
    }
  }
  PrimaryExpression(node) {
    if (node.children.length === 1) {
      return this.evaluate(node.children[0]);
    }
  }
  Literal(node) {
    return this.evaluate(node.children[0]);
  }
  NumericLiteral(node) {
    let str = node.value;
    let l = str.length;
    let value = 0;
    let n = 10;

    if (str.match(/^0b/)) {
      n = 2;
      l -= 2;
    } else if (str.match(/^0o/)) {
      n = 8;
      l -= 2;
    } else if (str.match(/^0x/)) {
      n = 16;
      l -= 2;
    }

    while (l--) {
      let c = str.charCodeAt(str.length - l - 1);
      if (c >= "a".charCodeAt(0)) {
        c = c - "a".charCodeAt(0) + 10;
      } else if (c >= "A".charCodeAt(0)) {
        c = c - "A".charCodeAt(0) + 10;
      } else if (c >= "0".charCodeAt(0)) {
        c = c - "0".charCodeAt(0);
      }
      value = value * n + c;
    }

    // console.log(value);
    return new JSNumber(node.value);
  }
  StringLiteral(node) {
    let result = [];
    for (let i = 1; i < node.value.length - 1; i++) {
      if (node.value[i] === "\\") {
        ++i;
        let c = node.value[i];
        let map = {
          '"': '"',
          "'": "'",
          "\\": "\\",
          0: String.fromCharCode(0x0000),
          b: String.fromCharCode(0x0008),
          f: String.fromCharCode(0x000c),
          n: String.fromCharCode(0x000a),
          r: String.fromCharCode(0x000d),
          t: String.fromCharCode(0x0009),
          v: String.fromCharCode(0x000b),
        };
        debugger;
        if (c in map) {
          result.push(map[c]);
        } else {
          result.push(c);
        }
      } else {
        result.push(node.value[i]);
      }
    }
    // console.log(result);
    return new JSString(result);
  }
  ObjectLiteral(node) {
    if (node.children.length === 2) {
      return {};
    }
    if (node.children.length === 3) {
      let object = new JSObject();
      this.PropertyList(node.children[1], object);
      // object.prototype =
      return object;
    }
  }
  PropertyList(node, object) {
    if (node.children.length === 1) {
      this.Property(node.children[0], object);
    } else {
      this.PropertyList(node.children[0], object);
      this.Property(node.children[2], object);
    }
  }
  Property(node, object) {
    let name;
    if (node.children[0].type === "Identifier") {
      name = node.children[0].name;
    } else if (node.children[0].type === "StringLiteral") {
      name = this.evaluate(node.children[0]);
    }
    object.set(name, {
      writable: true,
      enumerable: true,
      configable: true,
      value: this.evaluate(node.children[2]),
    });
  }
  BooleanLiteral(node) {
    if (node.value === "false") {
      return new JSBoolean(false);
    } else {
      return new JSBoolean(true);
    }
  }
  null() {
    return new JSNull();
  }
  AssignmentExpression(node) {
    if (node.children.length === 1) {
      return this.evaluate(node.children[0]);
    }
    let left = this.evaluate(node.children[0]);
    let right = this.evaluate(node.children[2]);
    left.set(right);
  }
  LogicalORExpression(node) {
    if (node.children.length === 1) {
      return this.evaluate(node.children[0]);
    }
    let result = this.evaluate(node.children[0]);
    if (result) {
      return result;
    } else {
      return this.evaluate(node.children[2]);
    }
  }
  LogicalANDExpression(node) {
    if (node.children.length === 1) {
      return this.evaluate(node.children[0]);
    }
    let result = this.evaluate(node.children[0]);
    if (!result) {
      return result;
    } else {
      return this.evaluate(node.children[2]);
    }
  }
  LeftHandSideExpression(node) {
    return this.evaluate(node.children[0]);
  }
  NewExpression(node) {
    if (node.children.length === 1) {
      return this.evaluate(node.children[0]);
    }
    if (node.children.length === 2) {
      let func = this.evaluate(node.children[1]);
      let args = this.evaluate(node.children[1]);
      return func.construct(args);
      //   let object = this.realm.Object.construct();
      //   let cls = this.evaluate(node.children[1]);
      //   let result = cls.call(object);
      //   if (typeof result === "object") {
      //     return result;
      //   } else {
      //     return object;
      //   }
    }
  }
  CallExpression(node) {
    if (node.children.length === 1) {
      return this.evaluate(node.children[0]);
    }
  }
  MemberExpression(node) {
    if (node.children.length === 1) {
      return this.evaluate(node.children[0]);
    }
    if (node.children.length === 3) {
      let obj = this.evaluate(node.children[0]).get();
      let prop = obj.get(node.chidlren[2].name);
      if ("value" in prop) {
        return prop.value;
      }
      if ("get" in prop) {
        return prop.get.call(obj);
      }
    }
  }
  Identifier(node) {
    // console.log(node);
    let runningEC = this.ecs[this.ecs.length - 1];
    return new Reference(runningEC.lexicalEnviroment, node.name);
  }
  Arguments(node) {
    if (node.chidlren.length === 2) {
      return [];
    } else {
      return this.evaluate(node.chidlren[1]);
    }
  }
  ArgumentList(node) {
    if (node.chidlren.length === 1) {
      let result = this.evaluate(node.children[0]);
      if (result instanceof Reference) {
        result = result.get();
      }
      return [result];
    } else {
      let result = this.evaluate(node.children[1]);
      if (result instanceof Reference) {
        result = result.get();
      }
      return this.evaluate(node.chidlren[0]).concat(result);
    }
  }
  Block(node) {
    if (node.chidlren.length === 2) {
      return;
    }
    let runningEC = this.ecs[this.ecs.length - 1];
    let newEC = new ExecutionContext(
      runningEC.realm,
      new EnvironmentRecord(runningEC.lexicalEnviroment),
      runningEC.variableEnviroment
    );
    this.ecs.push(newEC);
    let result = this.evaluate(node.chidlren[1]);
    this.ecs.pop(newEC);
    return result;
  }
  //   EOF() {
  //     return null;
  //   },
}
