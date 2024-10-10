---
title: ArrayDeque를 이용한 스택과 큐
date: "2024-03-29T12:00:00.000Z"
tags:  
  - "Kotlin"
---

알고리즘 문제를 풀이하다보면 DFS와 BFS 문제를 많이 접하는데요.

이때 스택과 큐를 유용하게 사용합니다.

코틀린은 ArrayDeque를 사용해서 스택과 큐를 구현할 수 있습니다.

<br>

## Stack

스택은 **후입선출(LIFO, Last In First Out)** 방식의 자료구조입니다. `ArrayDeque`를 사용하면 `addLast`로 요소를 추가하고, `removeLast`로 요소를 제거하여 스택 동작을 구현할 수 있습니다.


### 구현

```kotlin
fun main() {
    val stack = ArrayDeque<Int>()

    // push: 스택에 요소 추가
    stack.addLast(1)
    stack.addLast(2)
    stack.addLast(3)
    println("Stack after pushing: $stack")  // [1, 2, 3]

    // pop: 스택에서 요소 제거
    val poppedElement = stack.removeLast()
    println("Popped element: $poppedElement")  // 3
    println("Stack after popping: $stack")  // [1, 2]

    // peek: 스택의 가장 위에 있는 요소 확인
    val topElement = stack.last()
    println("Top element: $topElement")  // 2
}
```

### 예시 1: 문자열 뒤집기

```kotlin
fun reverseString(input: String): String {
    val stack = ArrayDeque<Char>()
    for (char in input) {
        stack.addLast(char)  // push
    }

    val reversed = StringBuilder()
    while (stack.isNotEmpty()) {
        reversed.append(stack.removeLast())  // pop
    }

    return reversed.toString()
}

fun main() {
    val original = "hello"
    val reversed = reverseString(original)
    println("Original: $original, Reversed: $reversed")  // Original: hello, Reversed: olleh
}
```

### 예시 2: 괄호 유효성 검사

```kotlin
fun isValidParentheses(s: String): Boolean {
    val stack = ArrayDeque<Char>()
    for (char in s) {
        when (char) {
            '(', '{', '[' -> stack.addLast(char)  // 여는 괄호는 스택에 넣는다
            ')' -> if (stack.isEmpty() || stack.removeLast() != '(') return false
            '}' -> if (stack.isEmpty() || stack.removeLast() != '{') return false
            ']' -> if (stack.isEmpty() || stack.removeLast() != '[') return false
        }
    }
    return stack.isEmpty()
}

fun main() {
    println(isValidParentheses("()[]{}"))  // true
    println(isValidParentheses("([)]"))    // false
    println(isValidParentheses("{[]}"))    // true
}
```

<br>

# Queue

큐는 **선입선출(FIFO, First In First Out)** 방식의 자료구조입니다. `ArrayDeque`를 사용하여 큐의 기본 동작을 구현할 수 있습니다. 큐에서는 `addLast`로 요소를 추가하고, `removeFirst`로 요소를 제거하여 선입선출을 구현합니다.

### 코틀린에서 `ArrayDeque`로 큐 구현

```kotlin
fun main() {
    val queue = ArrayDeque<Int>()

    // offer: 큐에 요소 추가
    queue.addLast(1)
    queue.addLast(2)
    queue.addLast(3)
    println("Queue after offering: $queue")  // [1, 2, 3]

    // poll: 큐에서 요소 제거
    val dequeuedElement = queue.removeFirst()
    println("Dequeued element: $dequeuedElement")  // 1
    println("Queue after polling: $queue")  // [2, 3]

    // peek: 큐의 첫 번째 요소 확인
    val frontElement = queue.first()
    println("Front element: $frontElement")  // 2
}
```

### 예시 1: 너비 우선 탐색(BFS)

```kotlin
fun bfs(graph: Map<Int, List<Int>>, start: Int) {
    val visited = mutableSetOf<Int>()
    val queue = ArrayDeque<Int>()
    queue.addLast(start)

    while (queue.isNotEmpty()) {
        val node = queue.removeFirst()
        if (node !in visited) {
            println("Visited: $node")
            visited.add(node)
            queue.addAll(graph[node].orEmpty())
        }
    }
}

fun main() {
    val graph = mapOf(
        1 to listOf(2, 3),
        2 to listOf(4, 5),
        3 to listOf(6, 7),
        4 to listOf(),
        5 to listOf(),
        6 to listOf(),
        7 to listOf()
    )
    bfs(graph, 1)
}
```

### 예시 2: 캐시 시스템 구현 (LRU)

```kotlin
class LRUCache(private val capacity: Int) {
    private val cache = ArrayDeque<Int>()

    fun refer(key: Int) {
        if (key in cache) {
            cache.remove(key)
        } else if (cache.size == capacity) {
            cache.removeFirst()
        }
        cache.addLast(key)
    }

    fun display() {
        println("Cache: $cache")
    }
}

fun main() {
    val cache = LRUCache(3)
    cache.refer(1)
    cache.refer(2)
    cache.refer(3)
    cache.display()  // Cache: [1, 2, 3]

    cache.refer(4)  // 1이 제거됨
    cache.display()  // Cache: [2, 3, 4]

    cache.refer(2)  // 2가 가장 최근으로 이동
    cache.display()  // Cache: [3, 4, 2]
}
```

