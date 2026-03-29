from flask import Flask, request, jsonify, render_template
import numpy as np
import joblib
import json
from services.predictor import predict

app = Flask(__name__)

# モデル・スケーラー・カラム情報を起動時に読み込む
model = joblib.load('model.pkl')
scaler = joblib.load('scaler.pkl')
with open('columns.json') as f:
    columns = json.load(f)

@app.route('/')
def index():
    return render_template('index.html', columns=columns)

@app.route('/predict', methods=['POST'])
def predict_route():
    data = request.get_json()
    result = predict(data)
    return jsonify({'price': result})

if __name__ == '__main__':
    app.run(debug=True)