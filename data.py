import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import OneHotEncoder
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

df1 = pd.read_csv("data/AB_US_2020.csv", low_memory=False)
df2 = pd.read_csv("data/AB_US_2023.csv", low_memory=False)

# room_typeをベクトルに変換
encoder = OneHotEncoder(sparse_output=False)

# データを学習させ、ワンホットベクトルに変換
df_one_hot_encoded_room_type = pd.get_dummies(df1['room_type'])

X = pd.concat([
    df1[['latitude']],
    df1[['longitude']],
    df_one_hot_encoded_room_type,
    df1[['minimum_nights']],
    df1[['number_of_reviews']]
], axis=1)

# 数値を標準化（外れ値を除去しなくても学習が安定）
scaler = StandardScaler()
X[['latitude', 'longitude', 'minimum_nights', 'number_of_reviews']] = scaler.fit_transform(
    X[['latitude', 'longitude', 'minimum_nights', 'number_of_reviews']]
)

y = np.log1p(df1['price'])

X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=42)

# モデル作成
rf = RandomForestRegressor(n_estimators=400, random_state=42, max_depth=10, min_samples_leaf=5)
rf.fit(X_train, y_train)

print("Training set score: {:.2f}".format(rf.score(X_train, y_train)))
print("Test score : {:.2f}".format(rf.score(X_test, y_test)))

y_pred_test = np.expm1(rf.predict(X_test))

print("pred :", np.round(y_pred_test, 2))