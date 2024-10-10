---
title: 코틀린 생성자 접근 제어
date: "2024-05-02T12:00:00.000Z"
tags:  
  - "Kotlin"
---

TypeScript에서 Class의 constructor는 무조건 public이었습니다.

사실 생성자가 `private`이나 `protected`같은 접근 제한이 될 수 있을 거란 생각을 안해봐서 그런지 전혀 필요성을 못 느꼈었는데요.

코틀린은 생성자에도 접근 제한을 줌으로써 생성자의 사용을 제한해서 객체의 생성과 접근을 매우 세밀하게 제어할 수 있게 해줍니다.

<br>

# Public Constructor (공개 생성자)

`public` 생성자는 클래스 외부에서 어디서든 접근할 수 있는 기본적인 생성자입니다.

### 활용: 기본 매개변수

코틀린에서는 생성자에 기본값을 제공할 수 있습니다. 이를 통해 생성자를 호출할 때 매개변수를 생략할 수 있습니다.

```kotlin
class Product(val name: String, val price: Double = 0.0)

fun main() {
    val p1 = Product("Generic")
    println("Product: ${p1.name}, Price: ${p1.price}")  // Price: 0.0

    val p2 = Product("Premium", 99.99)
    println("Product: ${p2.name}, Price: ${p2.price}")  // Price: 99.99
}
```

이 예시는 `Product` 클래스의 두 가지 인스턴스를 생성하는 방법을 보여줍니다. `price` 파라미터가 기본값을 가지고 있어, 일부 매개변수를 생략할 수 있습니다.

### 활용: 여러 생성자 오버로딩

`public` 생성자를 여러 개 정의할 수 있습니다. 이때 코틀린은 `constructor` 키워드를 사용해 보조 생성자를 정의합니다.

```kotlin
class Book(val title: String, val author: String) {
    var publishedYear: Int = 0

    constructor(title: String, author: String, year: Int) : this(title, author) {
        publishedYear = year
    }

    fun info() = "Title: $title, Author: $author, Published Year: $publishedYear"
}

fun main() {
    val book1 = Book("Kotlin Programming", "Mocha")
    println(book1.info())  // Published Year: 0

    val book2 = Book("Kotlin Programming", "Mocha", 2024)
    println(book2.info())  // Published Year: 2024
}
```


<br>

# Private Constructor (비공개 생성자)

`private` 생성자는 클래스 외부에서 직접 인스턴스를 생성할 수 없게 막습니다. 이를 통해 인스턴스 생성을 제한하고, 특정 로직을 통해서만 객체를 만들 수 있게 합니다.

### 활용: 싱글톤 패턴

`private` 생성자는 싱글톤 패턴에서 자주 사용되는데요.

```kotlin
object Logger {
    fun log(message: String) {
        println("LOG: $message")
    }
}

fun main() {
    Logger.log("This is a log message")  // LOG: This is a log message
}
```

`object`는 생성자 접근 제한을 통해 싱글톤 인스턴스를 보장하는 코틀린의 기능입니다.

`private` 생성자를 명시할 필요가 없습니다.

### 활용: 팩토리 메서드를 이용한 객체 생성

팩토리 메서드를 사용하여 `private` 생성자를 이용한 객체 생성을 제어할 수 있습니다.

```kotlin
class User private constructor(val name: String, val age: Int) {
    companion object {
        fun createMan(name: String): User {
            return User(name, 16)
        }

        fun woman(name: String): User {
            return User(name, 30)
        }
    }
}

fun main() {
    val man = User.createMan("Alice")
    val woman = User.woman("Bob")
    
    println("Man: ${man.name}, Age: ${man.age}")  // Age: 16
    println("Woman: ${woman.name}, Age: ${woman.age}")  // Age: 30
}
```

<br>

# Internal Constructor (모듈 내부 생성자)

`internal` 생성자는 동일한 모듈 내에서만 인스턴스를 생성할 수 있게 합니다. 

라이브러리나 모듈을 개발할 때 코드의 외부 노출을 줄이는 데 많이 사용한다고 합니다.

### 활용: API 클래스 보호

`internal` 생성자를 사용해 API 클래스의 인스턴스를 모듈 내부에서만 생성할 수 있게 할 수 있습니다.

```kotlin
class ApiService internal constructor(val endpoint: String) {
    fun fetch() = "Fetching data from $endpoint"
}

// 같은 모듈 내에서 사용 가능
fun main() {
    val service = ApiService("https://api.example.com")
    println(service.fetch())  // Fetching data from https://api.example.com
}
```

이 경우 `ApiService`는 모듈 내부에서는 인스턴스화할 수 있지만, 다른 모듈에서는 이 생성자에 접근할 수 없습니다.

### 활용: 모듈의 내부 클래스 관리

`internal` 생성자는 모듈 내부에서만 인스턴스화할 수 있으므로, API 설계 시 공개되지 않아야 할 클래스에 사용할 수 있습니다.

```kotlin
internal class ConfigManager internal constructor(val config: Map<String, String>) {
    fun getConfig(key: String): String? = config[key]
}

fun main() {
    val config = mapOf("url" to "https://example.com", "timeout" to "30s")
    val manager = ConfigManager(config)
    println(manager.getConfig("url"))  // https://example.com
}
```

이렇게 하면 `ConfigManager` 클래스는 모듈 외부에서는 인스턴스를 생성하거나 사용할 수 없습니다.

<br>

# Protected Constructor (상속 관계에서의 생성자)

`protected` 생성자는 클래스 외부에서는 사용할 수 없지만, 상속받은 클래스에서는 호출할 수 있습니다.

### 활용: 상속된 클래스에서만 사용 가능한 생성자

```kotlin
open class Animal protected constructor(val species: String) {
    fun makeSound() = "$species is making a sound"
}

class Dog : Animal("Dog") {
    fun bark() = "Dog is barking"
}

fun main() {
    val dog = Dog()
    println(dog.makeSound())  // Dog is making a sound
    println(dog.bark())  // Dog is barking
}
```


### 활용: 추상 클래스에서 사용

추상 클래스에서 `protected` 생성자를 사용하면, 외부에서는 클래스를 인스턴스화할 수 없고 상속 관계에서만 인스턴스를 만들 수 있습니다.

```kotlin
abstract class Employee protected constructor(val name: String) {
    abstract fun work()
}

class Developer(name: String) : Employee(name) {
    override fun work() = println("$name is writing code")
}

fun main() {
    val dev = Developer("Mocha")
    dev.work()  // Mocha is writing code
}
```

`Employee` 클래스는 `protected` 생성자를 통해 상속을 강제하고, 하위 클래스에서만 생성이 가능합니다.

