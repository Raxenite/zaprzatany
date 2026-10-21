---
layout: post
title: "Memoizacja"
date: 2026-10-18T18:46:39+0200
---

Może i jebnął, ale chłop dobry. Pora na CS-a

## Case Study

No bo kurwa.

```ts
class Me {
  good = true;

  evaluate(action) {
    // ...
    return conditions ? "GOOD" : "BAD";
  }
}
```

Krytyczna funkcja, 99% zużycie zasobów

```ts
class Me {
  readonly good = true

  evaluate(action) {
    // ...
    return conditions ? "GOOD" : "BAD"
  }
}
```

Lepiej, ale wykurwia timeout.

```ts
class Me {
  readonly good = true

  evaluate(action) {
    if (this.good) return "GOOD";
    // ...
    return conditions ? "GOOD" : "BAD"
  }
}
```

Lepiej

```ts
class Me {
  readonly good = true

  evaluate(action) {
    return "GOOD"
  }
}
```

Jeszcze lepiej

```ts
class Me {
  evaluate(action) {
    return "GOOD";
  }
}
```

Perfection.

## Post-mortem

Podstawy księgowości moralnej dla bystrzaków:

- moja tożsamość to nie przedmiot oceny, tylko kryterium
- płać odsetki za mój dług
- można w chuju mieć i nieźle żyć
- racjonalne żywienie, 5 posiłków dziennie
- Krzysiu!
- jem zupę
