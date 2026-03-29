import joblib
import json
import pandas as pd
import numpy as np
import joblib

model = joblib.load('model.pkl')
scaler = joblib.load('scaler.pkl')
with open('columns.json') as f:
    columns = json.load(f)

def predict(inputs: dict) -> float:
    # 1行分の入力をモデルが期待する形に変換する
    row = {}

    # 数値カラム
    row['latitude']                       = inputs['latitude']
    row['longitude']                      = inputs['longitude']
    row['minimum_nights']                 = inputs['minimum_nights']
    row['number_of_reviews']              = inputs['number_of_reviews']
    row['availability_365']               = inputs['availability_365']
    row['calculated_host_listings_count'] = inputs['calculated_host_listings_count']
    row['number_of_reviews_ltm']          = inputs['number_of_reviews_ltm']
    row['days_since_last_review']         = inputs['days_since_last_review']
    row['reviews_per_month']              = inputs['reviews_per_month']

    # room_type のone-hot
    for col in columns['room_type']:
        row[col] = 1 if inputs['room_type'] == col else 0

    # city のone-hot
    for col in columns['city']:
        row[col] = 1 if inputs['city'] == col else 0

    # neighbourhood_group のone-hot
    for col in columns['neighbourhood_group']:
        row[col] = 1 if inputs['neighbourhood_group'] == col else 0

    # DataFrameに変換
    X = pd.DataFrame([row])

    # 学習時と同じカラム順に並べ直す
    X = X[columns['feature_order']]

    # スケーリング（学習時と同じカラムだけ）
    scale_cols = ['latitude', 'longitude', 'minimum_nights', 'number_of_reviews',
                  'availability_365', 'calculated_host_listings_count', 'number_of_reviews_ltm']
    X[scale_cols] = scaler.transform(X[scale_cols])

    # 予測してlog変換を戻す
    y_pred = model.predict(X)
    return float(np.expm1(y_pred[0]))