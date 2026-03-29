import pandas as pd
import numpy as np
import joblib
import json
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error

df = pd.read_csv("data/AB_US_2023.csv", low_memory=False)

df = df[df['price'] > 0]
df = df[df['price'] < 1000]
df = df[df['minimum_nights'] <= 30]
df['reviews_per_month'] = df['reviews_per_month'].fillna(0)

df_room_type = pd.get_dummies(df['room_type'])
df_city = pd.get_dummies(df['city'])
df_neighbourhood_group = pd.get_dummies(df['neighbourhood_group'])

df['last_review'] = pd.to_datetime(df['last_review'])
df['days_since_last_review'] = (pd.Timestamp('2023-12-31') - df['last_review']).dt.days
df['days_since_last_review'] = df['days_since_last_review'].fillna(9999)

X = pd.concat([
    df[['latitude']],
    df[['longitude']],
    df_room_type,
    df[['minimum_nights']],
    df[['number_of_reviews']],
    df[['availability_365']],
    df[['calculated_host_listings_count']],
    df[['number_of_reviews_ltm']],
    df_city,
    df_neighbourhood_group,
    df[['days_since_last_review']],
    df[['reviews_per_month']]
], axis=1)

scaler = StandardScaler()
X[['latitude', 'longitude', 'minimum_nights', 'number_of_reviews', 'availability_365', 'calculated_host_listings_count', 'number_of_reviews_ltm']] = scaler.fit_transform(
    X[['latitude', 'longitude', 'minimum_nights', 'number_of_reviews', 'availability_365', 'calculated_host_listings_count', 'number_of_reviews_ltm']]
)

y = np.log1p(df['price'])

X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=42)

rf = RandomForestRegressor(
    n_estimators=50,
    random_state=42,
    max_depth=18,
    min_samples_leaf=4,
    n_jobs=-1
)
rf.fit(X_train, y_train)

y_true = np.log1p(df['price'])
y_pred = rf.predict(X)
y_pred_exp = np.expm1(y_pred)
y_true_exp = np.expm1(y_true)

rmse_fixed = np.sqrt(mean_squared_error(y_true_exp, y_pred_exp))
mae_fixed  = mean_absolute_error(y_true_exp, y_pred_exp)

joblib.dump(rf, 'model.pkl')
joblib.dump(scaler, 'scaler.pkl')

columns = {
    'room_type': list(df_room_type.columns),
    'city': list(df_city.columns),
    'neighbourhood_group': list(df_neighbourhood_group.columns),
    'feature_order': list(X.columns)
}
with open('columns.json', 'w') as f:
    json.dump(columns, f)

# 学習後に保存
metrics = {
    "rmse": float(rmse_fixed),
    "mae": float(mae_fixed)
}
with open("metrics.json", "w") as f:
    json.dump(metrics, f)