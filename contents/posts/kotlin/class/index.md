---
title: 코틀린 다양한 클래스
date: "2024-04-20T12:00:00.000Z"
tags:  
  - "Kotlin"
---

TypeScript를 사용할 때 Class는 단순히 객체지향 프로그래밍의 기본적인 틀을 제공하는 
용도였습니다. 

클래스 내부에 속성이나 메서드를 정의하고, 이를 기반으로 객체를 생성하는 것이 전부였죠.

그런데 코틀린을 공부하다 보니 클래스의 활용 범위가 훨씬 넓다는 것을 알게 되었습니다.

클래스가 다재다능하게 쓰인다는 점이 당황스러우면서도 매력적이었습니다. 

이번 기회에 코틀린의 다양한 클래스 개념들을 정리하며 이해도를 높여보려 합니다.

### Class

코틀린에서의 클래스는 기본적으로 객체를 만들기 위한 도구입니다. 

TypeScript와 마찬가지로 속성과 메서드를 정의할 수 있지만, 코틀린에서는 조금 더 강력한 기능을 제공합니다. 

Kotlin에서는 클래스 내부에 동반 객체(companion object)를 정의할 수 있어요. 이는 Java의 static 멤버와 유사하지만, 조금 더 강력한 기능을 제공하죠. Companion object는 클래스와 관련된 함수를 정의하거나, 팩토리 메서드를 만들 때 유용합니다.


```kotlin
class MyClass {
    companion object {
        const val CONSTANT = "상수"
        
        fun printConstant() {
            println(CONSTANT)
        }
    }
}
```

이렇게 `companion object`를 사용하면 객체를 생성하지 않고도 `MyClass.CONSTANT`와 같이 상수나 함수를 호출할 수 있습니다.

### Data Class

`data class`는 주로 데이터를 담기 위한 클래스입니다.

일반 클래스와는 다르게 코틀린은 `data class`에서 `equals()`, `hashCode()`, `toString()` 같은 메서드를 자동으로 생성해 줍니다. 

데이터 전송 객체를 만들 때 특히 유용해요.

```kotlin
data class User(val name: String, val age: Int)
```

이렇게 정의하면 `User` 클래스는 자동으로 `name`과 `age` 속성을 비교하거나 출력하는 데 필요한 메서드들을 가지게 됩니다. TypeScript에서는 이러한 기능을 직접 구현해야 했지만, 

코틀린에서는 간단한 `==` 연산자로 비교가 가능합니다.

### Enum Class

코틀린에서 `enum class`는 열거형을 정의할 때 사용됩니다. 
TypeScript에서는 `enum`이 단순히 상수들의 집합이었지만, 
코틀린에서는 클래스 형태로 정의됩니다. 

즉, `enum class`는 각 열거형 상수마다 고유한 메서드나 속성을 가질 수 있으며, 더 복잡한 동작을 수행할 수 있습니다.

```kotlin
enum class Color(val rgb: Int) {
    RED(0xFF0000),
    GREEN(0x00FF00),
    BLUE(0x0000FF);
}

// --- or ---

enum class Color {
    RED, GREEN, BLUE;

    fun printColor() {
        println("The color is $this")
    }
}

Color.RED.printColor()  // The color is RED
```

이렇게 `enum class`도 단순히 값만을 정의하는 것이 아니라 각 열거형 상수마다 속성을 부여하거나 메서드를 추가할 수 있는 유연성을 제공합니다.

### Sealed Class

`sealed class`는 계층적인 클래스 설계를 할 때 매우 유용합니다. 

TypeScript에서의 유니언 타입과 비슷한데, 좀 더 강타입으로 볼 수 있습니다. 


```kotlin
sealed class Shape {
    data class Circle(val radius: Double) : Shape()
    data class Rectangle(val width: Double, val height: Double) : Shape()
}
```
이렇게 상속 가능한 클래스의 범위를 제한할 수 있습니다.

`sealed class`를 사용하면, 특정 클래스 계층에서 가능한 모든 하위 클래스들을 명시적으로 정의해서 패턴 매칭을 더 쉽게 할 수 있습니다.

### Object

코틀린의 `object`는 싱글톤 패턴을 구현할 때 사용됩니다. 

객체를 오직 하나만 생성하도록 보장해 주는 개념으로, 전역적인 상태나 유틸리티 함수들을 관리할 때 유용합니다. 

TypeScript에서는 이와 비슷한 개념을 `module`이나 `namespace`로 처리했을 수도 있겠지만, 코틀린의 `object`는 좀 더 명확하고 일관된 사용 방법을 제공합니다.

```kotlin
object Singleton {
    val name = "유일한 객체"
    
    fun printName() {
        println(name)
    }
}
```

이렇게 정의된 `object`는 프로그램 내에서 단 하나만 생성되며, 언제나 같은 인스턴스를 참조하게 됩니다.


<br>

<br>

TypeScript에서는 직접 구현해야 했던 많은 기능들이 코틀린에서는 간결하고 직관적인 방식으로 제공되는 것이 코틀린을 더 열심히 공부해보고 싶다는 생각을 들게 해주네여