---
title: 코틀린 groupBy
date: "2024-11-03T12:00:00.000Z"
tags:  
  - "Kotlin"
---

RDBMS를 사용하다 보면 GroupBy를 자주 이용하게 됩니다.
주로 집계함수랑 사용되는데요.

예를들어 판매 데이터를 지역별, 제품별, 날짜별로 집계할 때 사용할 수 있고,
카테고리별로 총 매출을 구하거나 사용자별 평균 구매 금액을 계산할 때 처럼 다양한 상황에서 활용할 수 있습니다.

하지만 SQL만으로는 처리하지 못하거나 혹은 전체를 조회한 후 애플리케이션에서 그룹핑을 하는게 더 유리한 경우가 있습니다.
Kotlin은 이런 경우 `groupBy`라는 함수를 사용할 수 있습니다.

`groupBy`는 컬렉션의 요소들을 특정 기준에 따라 그룹화 할 때 유용하게 사용하는 기능입니다.
이 함수를 이용해서 컬렉션을 그룹화한 후, 그룹화 기준을 키로 하고 해당 키에 속하는 요소들을 값으로 가지는 Map을 반환합니다.

## 기본 사용법

---

짝수와 홀수로 그룹화해보겠습니다.

```kotlin
val numbers = listOf(1, 2, 3, 4, 5, 6)
val grouped = numbers.groupBy { if (it % 2 == 0) "Even" else "Odd" }

println(grouped)
```

```kotlin
{Odd=[1, 3, 5], Even=[2, 4, 6]}
```

## 제품과 이미지 그룹화

---

조금 더 복잡한 예시로, 제품 목록과 관련된 이미지 목록을 그룹화하는 방법을 살펴보겠습니다. 각 제품에는 여러 개의 이미지가 있을 수 있으므로, 제품별로 이미지를 그룹화하는 예시입니다.

먼저 데이터 클래스부터 정의해보겠습니다.

```kotlin
data class Product(val id: Long, val name: String)
data class Category(val id: Long, val name: String)
data class ProductImage(val productId: Long, val url: String)
```

그리고 groupBy를 사용하여 제품별 이미지를 그룹화해보겠습니다.

```kotlin
val products = listOf(
    Product(1, "Smartphone"),
    Product(2, "Laptop"),
    Product(3, "T-shirt")
)

val productImages = listOf(
    ProductImage(1, "smartphone_image1.jpg"),
    ProductImage(1, "smartphone_image2.jpg"),
    ProductImage(2, "laptop_image1.jpg"),
    ProductImage(3, "tshirt_image1.jpg")
)

val productsWithImages = products.groupBy { it.id }
    .mapValues { entry -> productImages.filter { it.productId == entry.key } }

println(productsWithImages)
```

```kotlion
{
 1=[ProductImage(productId=1, url=smartphone_image1.jpg), ProductImage(productId=1, url=smartphone_image2.jpg)],
 2=[ProductImage(productId=2, url=laptop_image1.jpg)],
 3=[ProductImage(productId=3, url=tshirt_image1.jpg)]
}
```

이렇게 각 제품에 대해 해당하는 이미지를 모은 후 그룹화 한 결과를 확인할 수 있습니다.

## 중복 제거하기

---

뿐만 아니라, `distinct`라는 체이닝 메서드도 제공하는 데 이를 이용하면 중복을 제거할 수 있습니다.

```kotlin
val productsWithUniqueImages = products.groupBy { it.id }
    .mapValues { entry -> 
        productImages.filter { it.productId == entry.key }
            .map { it.url }
            .distinct()
    }

println(productsWithUniqueImages)
```

```kotlin
{
 1=[smartphone_image1.jpg, smartphone_image2.jpg], 
 2=[laptop_image1.jpg], 
 3=[tshirt_image1.jpg]
}
```


<br>

이렇게 Kotlin의 groupBy 함수를 이용해 데이터를 그룹화하고 그 그룹에 
대해 추가적인 작업을 할 수 있습니다.

특히 데이터베이스에서 여러 테이블을 조인하여 데이터를 그룹화할 때 매우 유용하니, 잘 활용하면
DB 부하를 낮추는 데 큰 도움이 됩니다.