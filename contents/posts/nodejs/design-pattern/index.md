---
title: 디자인 패턴 (싱글톤, 팩토리, 옵저버)
date: "2023-02-03T12:00:00.000Z"
tags:  
  - "Node.js"
---

# Design Pattern with JS

최근에 몇번 사용해본 3가지 디자인패턴들을 정리해보려고 합니다.&#x20;

## 싱글톤패턴(Singleton Pattern) <a href="#headerid_0" id="headerid_0"></a>

싱글톤패턴은 소프트웨어 디자인 패턴 중 하나로, 클래스의 인스턴스를 전역적으로 하나만 생성하고, 이 인스턴스에 대한 접근을 제공하는 패턴입니다. 이는 객체의 생성과 관련된 문제를 해결하고, 중복된 인스턴스 생성을 방지하기 위해 사용됩니다.\
보통 데이터베이스 연결 모듈에 많이 사용합니다.

### 구성 요소 <a href="#headerid_1" id="headerid_1"></a>

싱글톤패턴은 일반적으로 다음과 같은 구성 요소로 이루어집니다:

1. 싱글톤 클래스(Singleton Class): 싱글톤 패턴을 구현하는 클래스입니다. 싱글톤 인스턴스를 생성하고, 이를 통해 다른 객체들이 접근할 수 있도록 합니다. 보통은 해당 클래스의 생성자를 private으로 선언하여 외부에서 직접 인스턴스를 생성하지 못하도록 합니다.
2. 인스턴스(instance): 싱글톤 클래스에서 생성된 유일한 인스턴스입니다. 전역적으로 접근 가능하며, 다른 객체들은 이 인스턴스를 통해 기능을 사용하거나 데이터를 공유할 수 있습니다.

### 싱글톤패턴의 장점 <a href="#headerid_2" id="headerid_2"></a>

싱글톤패턴은 다음과 같은 장점을 가지고 있습니다:

1. 유일한 인스턴스: 싱글톤패턴은 오직 하나의 인스턴스만을 생성하므로, 여러 곳에서 동일한 인스턴스에 접근할 수 있습니다. 이를 통해 데이터의 일관성을 유지하고, 중복된 인스턴스 생성으로 인한 자원 낭비를 방지할 수 있습니다.
2. 전역적인 접근성: 싱글톤패턴의 인스턴스는 전역적으로 접근 가능하므로, 다른 객체들은 어디서든지 이 인스턴스를 사용하여 데이터를 공유하거나 기능을 호출할 수 있습니다.
3. 지연된 초기화: 싱글톤패턴은 인스턴스를 처음 사용할 때까지 생성하지 않으며, 처음으로 호출될 때 인스턴스를 생성합니다. 이를 통해 초기화에 필요한 비용을 최소화할 수 있습니다.

**싱글톤패턴의 주의사항**

싱글톤패턴을 사용할 때 주의해야 할 사항들은 다음과 같습니다:

1. 멀티스레드 환경: 멀티스레드 환경에서는 동시에 여러 스레드가 인스턴스를 생성할 수 있으므로, 동기화를 고려해야 합니다. 인스턴스 생성 시 동기화를 보장하거나, 인스턴스를 미리 생성하여 스레드 안전성을 확보하는 방법을 고려해야 합니다.
2. 테스트와 확장성: 싱글톤패턴은 테스트와 확장성 측면에서 어려움을 초래할 수 있습니다. 인스턴스 의존성을 가진 객체들은 모두 싱글톤 인스턴스에 의존하므로, 테스트할 때 이 의존성을 관리해야 합니다. 또한, 싱글톤패턴은 유연성과 확장성을 제한할 수 있으므로, 이를 고려하여 설계해야 합니다.

#### 예시 <a href="#headerid_4" id="headerid_4"></a>

```typescript
  
// Database 모듈
class Database {
  constructor(url) {
    if (!Database.instance) Database.instance = createConnection(url)
      return Database.instance
  }

  connect() {
    return this.instance
  }
}

const db1 = new Database()
const db2 = new Database()

console.log(db1 === db2)
// true
```

&#x20;

## 팩토리 패턴 (Factory Pattern) <a href="#headerid_5" id="headerid_5"></a>

팩토리 패턴은 객체 생성을 처리하는 디자인 패턴으로, 객체의 생성을 호출하는 코드로부터 분리시켜 유연성과 확장성을 제공하는 패턴입니다. 이 패턴은 인터페이스를 통해 객체를 생성하고 반환하는 팩토리 클래스를 정의하며, 클라이언트는 팩토리 클래스를 통해 필요한 객체를 생성합니다.

### 구성 요소 <a href="#headerid_6" id="headerid_6"></a>

팩토리 패턴은 일반적으로 다음과 같은 구성 요소로 이루어집니다:

1. 제품 클래스(Product Class): 제품 인터페이스를 구현하는 구체적인 객체 클래스입니다. 팩토리 패턴에서 생성될 객체들이 될 수 있습니다.
2. 팩토리 클래스(Factory Class): 팩토리 인터페이스를 구현하여 실제 객체의 생성을 담당하는 클래스입니다. 팩토리 클래스는 클라이언트의 요청에 따라 적절한 제품 객체를 생성하여 반환합니다.

### 팩토리 패턴의 장점 <a href="#headerid_7" id="headerid_7"></a>

1. 유연성과 확장성: 팩토리 패턴은 객체 생성을 추상화하고, 클라이언트와 구체적인 객체 생성 코드를 분리함으로써 유연성과 확장성을 제공합니다. 새로운 제품 클래스를 추가하거나 변경해도 클라이언트 코드를 수정할 필요가 없으며, 팩토리 클래스만 수정하면 됩니다.
2. 코드 중복 최소화: 팩토리 패턴은 객체 생성 코드를 중복해서 사용하는 것을 방지합니다. 객체 생성 로직을 팩토리 클래스에 집중시킴으로써 코드 중복을 최소화할 수 있습니다.
3. 객체 생성의 캡슐화: 팩토리 패턴은 객체 생성을 팩토리 클래스에 캡슐화함으로써 객체 생성 로직을 감춥니다. 클라이언트는 단순히 팩토리 클래스의 메서드를 호출하여 필요한 객체를 얻을 수 있습니다.

**팩토리 패턴의 주의사항**

팩토리 패턴을 사용할 때 주의해야 할 사항들은 다음과 같습니다:

1. 복잡성 증가: 팩토리 패턴은 객체 생성 관련 클래스와 인터페이스를 추가로 도입하기 때문에 일정한 복잡성을 가질 수 있습니다. 팩토리 패턴이 실제로 필요한지, 간단한 객체 생성을 위해 복잡한 팩토리 구조를 도입할 필요가 있는지 신중하게 고려해야 합니다.
2. 의존성 증가: 팩토리 패턴은 클라이언트가 팩토리 클래스에 의존하게 됩니다. 이는 클라이언트 코드와 팩토리 클래스 사이의 강한 결합을 만들어낼 수 있으며, 이를 해결하기 위해 DI(Dependency Injection)와 같은 기술을 적용할 수 있습니다.

```typescript
class CoffeeMaker {
  prepare() {
    throw new Error("This method must be overridden");
  }

  brew() {
    throw new Error("This method must be overridden");
  }

  pour() {
    throw new Error("This method must be overridden");
  }
}

class EspressoMaker extends CoffeeMaker {
  prepare() {
    console.log("Preparing espresso...");
  }

  brew() {
    console.log("Brewing espresso...");
  }

  pour() {
    console.log("Pouring espresso into a cup...");
  }
}

class LatteMaker extends CoffeeMaker {
  prepare() {
    console.log("Preparing latte...");
  }

  brew() {
    console.log("Brewing espresso for latte...");
  }

  pour() {
    console.log("Pouring espresso and milk into a cup for latte...");
  }
}

class EspressoMakerFactory extends CoffeeMakerFactory {
  createCoffeeMaker() {
    return new EspressoMaker();
  }
}

class LatteMakerFactory extends CoffeeFactory {
  createCoffeeMaker() {
    return new LatteMaker();
  }
}

const factoryList = {
    EspressoMakerFactory,
    LatteMakerFactory,
}

class CoffeeFactory {
    static createCoffeeMaker(type) {
        const factory = factoryList[type]
        return factory.createCoffeeMaker()
    }
}

const makeCoffee = (coffee) => {
    coffee.prepare()
    coffee.brew()
    coffee.pour()
    console.log('커피 완성')
}
const coffeeMaker = CoffeeFactory.createCoffeeMaker('LatteMakerFactory')
makeCoffee(coffeeMaker)
// 라떼 완성
```

&#x20;

## 옵저버 패턴 (Observer Pattern) <a href="#headerid_9" id="headerid_9"></a>

옵저버 패턴은 객체 간의 일대다 의존 관계를 정의하여, 어떤 객체의 상태가 변경되었을 때, 그 객체에 의존하는 다른 객체들에게 자동으로 변경 사항을 알리는 디자인 패턴입니다. 이를 통해 객체 간의 느슨한 결합을 유지하면서 상호작용할 수 있습니다.

### 구성 요소 <a href="#headerid_10" id="headerid_10"></a>

옵저버 패턴은 주로 다음과 같은 구성 요소로 이루어집니다:

1. 주제(Subject): 상태 변경을 관리하는 주체 객체입니다. 주제 객체는 옵저버 객체들을 등록하고, 상태 변경이 발생하면 등록된 옵저버들에게 알립니다.
2. 옵저버(Observer): 주제 객체의 상태 변경을 감시하는 객체입니다. 옵저버는 주제 객체에 등록되어 상태 변경이 발생하면 알림을 받고, 필요에 따라 적절한 동작을 수행합니다.

### 동작 방식 <a href="#headerid_11" id="headerid_11"></a>

옵저버 패턴은 다음과 같은 동작 방식으로 작동합니다:

1. 등록: 옵저버는 주제 객체에 등록되어야 합니다. 이를 통해 주제 객체는 상태 변경이 발생하면 등록된 모든 옵저버에게 알릴 수 있습니다.
2. 알림: 주제 객체의 상태가 변경되면 등록된 모든 옵저버에게 알립니다. 이를 위해 주제 객체는 등록된 옵저버들의 특정 메서드(예: `update()`)를 호출합니다.
3. 상태 업데이트: 옵저버는 알림을 받으면 주제 객체의 상태 변경을 확인하고 필요한 동작을 수행합니다. 이를 통해 옵저버는 주제 객체의 상태에 따라 독립적으로 업데이트될 수 있습니다.

### 옵저버 패턴의 장점 <a href="#headerid_12" id="headerid_12"></a>

옵저버 패턴은 다음과 같은 장점을 가지고 있습니다:

1. 느슨한 결합: 주제 객체와 옵저버 객체는 느슨하게 결합됩니다. 주제 객체는 옵저버 객체들의 존재를 알지만, 구체적인 구현에 대해 알지 않습니다. 이를 통해 주제 객체와 옵저버 객체들은 독립적으로 확장될 수 있습니다.
2. 상태 변경 알림: 주제 객체의 상태 변경이 발생하면 등록된 모든 옵저버에게 알림이 전달됩니다. 이를 통해 객체들 간의 상호작용을 쉽게 구현 할 수 있습니다.
3. 확장성: 새로운 옵저버를 추가하거나 제거하는 것이 비교적 간단합니다. 주제 객체와 옵저버 객체 간의 의존성을 최소화하고, 확장성을 확보할 수 있습니다.

#### 예시 <a href="#headerid_13" id="headerid_13"></a>

```typescript

  
// Subject (주제) 클래스
class Subject {
  constructor() {
    this.observers = []; // 옵저버들을 저장할 배열
  }

  // 옵저버 등록
  addObserver(observer) {
    this.observers.push(observer);
  }

  // 상태 변경 및 옵저버 알림
  setState(state) {
    this.state = state;
    this.notifyObservers();
  }

  // 등록된 옵저버들에게 알림
  notifyObservers() {
    this.observers.forEach(observer => {
      observer.update(this.state);
    });
  }
}

// Observer (옵저버) 클래스
class Observer {
  constructor(name) {
    this.name = name;
  }

  // 상태 업데이트 처리
  update(state) {
    console.log(`[${this.name}] 상태 업데이트: ${state}`);
  }
}

// 클라이언트 코드
const subject = new Subject(); // 주제 객체 생성

const observer1 = new Observer('Observer 1'); // 옵저버 1 생성
const observer2 = new Observer('Observer 2'); // 옵저버 2 생성

subject.addObserver(observer1); // 옵저버 1 등록
subject.addObserver(observer2); // 옵저버 2 등록

subject.setState('상태 변경 발생'); // 상태 변경 및 옵저버 알림
```