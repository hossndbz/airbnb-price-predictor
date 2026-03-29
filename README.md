# Airbnb 宿泊料金予測モデル

## 特徴量と目的変数

### 目的変数

- `price`（宿泊料金）

### 入力特徴量例

- 都市（`City`）
- 部屋タイプ（`Room Type`）
- 緯度・経度（`Latitude`, `Longitude`）
- 最低宿泊日数（`Minimum Nights`）
- レビュー数（`Number of Reviews`）
- 利用可能日数（`Availability 365`）
- ホストの物件数（`Calculated Host Listings Count`）
- 月間レビュー数（`Reviews per Month`）
- 最終レビューからの日数（`Days Since Last Review`）

## モデル

- ランダムフォレスト回帰（`RandomForestRegressor`）
- 学習済みモデルを `model.pkl` として保存
- 入力データは `StandardScaler` で標準化済み

## データ

- 本プロジェクトでは **Airbnb Open Data (アメリカ物件情報)** を利用
- 使用データ: `AB_US_2023.csv`
- データ提供元: [Kaggle – Airbnb Open Data](https://www.kaggle.com/datasets)
- データ内容: Airbnb物件の位置情報（緯度・経度）、部屋タイプ、宿泊料金、レビュー数など、物件の属性情報を含む
- 外れ値は除去済み
  - `price > 0` 且つ `price < 1000`
  - `minimum_nights ≤ 30`
  - `reviews_per_month` の欠損は 0 で補完

## モデル評価

学習済みモデルをテストセットで評価した結果：

- RMSE: 113.37
- MAE: 63.31

  ※ 平均的に予測価格と実際の価格の差は約 $63 程度
