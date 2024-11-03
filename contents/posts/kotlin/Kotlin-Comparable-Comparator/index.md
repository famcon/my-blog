---
title: 코틀린에서 비교, 정렬
date: "2024-03-08T12:00:00.000Z"
tags:  
  - "Kotlin"
---

## Comparable
---

```kotlin
public interface Comparable<in T> {
    public operator fun compareTo(other: T): Int
}
```

Comparable을 상속한 객체는 compare 함수를 오버라이딩해서 동일 타입의 객체와 
comparteTo와 같은 함수를 이용합니다.

```kotlin
class HeadPhone(
    var price: Int,
    var name: String,
) : Comparable<HeadPhone> {
    override fun compareTo(other: HeadPhone): Int =
        when {
            this.price > other.price -> 1
            this.price < other.price -> -1
            else -> 0
        }
}

fun main() {
    val airpod = HeadPhone(150000, "에어팟")
    val airpodPro = HeadPhone(200000, "에어팟 프로")

    println(airpodPro > airpod) // true
    println(airpodPro.compareTo(airpod)) // 1
}
```

위 결과처럼 객체간의 >, < 비교를 지원합니다.


## Comparator
---

Comparator는 규칙입니다. 

정률 순서를 지정하고 싶을 때 이용합니다.

```kotlin
listOf<HeadPhone>(...)
        .sortedWith(
            Comparator<HeadPhone> { headPhone1, headPhone2 ->
                headPhone1.price.compareTo(headPhone2.price)
            },
        ).forEach { println("${it.price} ${it.name}") }
```

Comparator를 람다로 넘겨 규칙을 설정할 수 있습니다.


## Sort
---

Collection을 정렬하는 함수로 오름차순을 기본으로 정렬합니다.

```kotlin
val list = mutableListOf(1, 2, 7, 6, 5, 6)
list.sort()
println(list)  // [1, 2, 5, 6, 6, 7]
```

Collection 자체의 원소 순서를 변경합니다.

내림차순은 `sortDescending`을 이용합니다.

```kotlin
list.sortDescending()
println(list) // [7, 6, 6, 5, 2, 1]
```


## Sorted
---

Sort와 달리 기존 Collection을 Copy해 새로이 정렬된 Collection을 생성합니다.

```kotlin
val list = mutableListOf(1, 2, 7, 6, 5, 6)
val sorted = list.sorted()
println(sorted)  // [1, 2, 5, 6, 6, 7]
println(list)    // [1, 2, 7, 6, 5, 6]
```

내림차순은 `sortedByDescending`를 이용합니다.

```kotlin
val sortedDesc = list.sortedDescending()
println(sortedDesc) // [7, 6, 6, 5, 2, 1]
println(list) // [1, 2, 7, 6, 5, 6]
```


## SortBy
---

객체의 특정 프로퍼티를 기준으로 정해 정렬을 할 수 있습니다.

```kotlin
val list = mutableListOf(1 to "a", 2 to "b", 7 to "c", 6 to "d", 5 to "c", 6 to "e")
list.sortBy { it.second }
println(list)  // [(1, a), (2, b), (7, c), (5, c), (6, d), (6, e)]
```

역시 내림차순은 `sortByDescending`을 이용합니다.


## SortWith
---

Comparator를 파라미터로 받아 정렬을 합니다.

```kotlin
val list = mutableListOf(1 to "a", 2 to "b", 7 to "c", 6 to "d", 5 to "c", 6 to "e")
list.sortWith(compareBy({it.second}, {it.first}))
println(list)  // [(1, a), (2, b), (5, c), (7, c), (6, d), (6, e)]
```