# Perf measurement results -

| Components Rendered | React (ms) | Emotion (ms) | Result (%) | Comments                                                                                                                    |
| ------------------- | ---------- | ------------ | ---------- | --------------------------------------------------------------------------------------------------------------------------- |
| 100                 | 2.289      | 9.108        | 297        |                                                                                                                             |
| 1000                | 56.360     | 29.2035      | 93         |                                                                                                                             |
| 1500                | 99.4242    | 36.9209      | 169        |                                                                                                                             |
| 2000                | 158.7093   | 44.7079      | 254        |                                                                                                                             |
| 5000                | 885.407    | 94.536       | 836        |                                                                                                                             |
| 10000               | 3659.1043  | 209.558      | 1646       | Simplifyng the style insertion to just be document.head.appendChild(node) in the react code changed the time taken to 600ms |
