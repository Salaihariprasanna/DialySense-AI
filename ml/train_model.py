import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

def generate_synthetic_dialysis_data(n_samples=6000, random_state=42):
    np.random.seed(random_state)
    
    # Generate realistic baseline distributions
    ages = np.random.randint(25, 85, size=n_samples)
    
    # 60% Normal, 25% Moderate, 15% High Risk samples
    n_normal = int(n_samples * 0.60)
    n_moderate = int(n_samples * 0.25)
    n_high = n_samples - n_normal - n_moderate
    
    # 1. Normal Profiles
    hr_normal = np.random.normal(74, 8, n_normal).clip(60, 95)
    spo2_normal = np.random.normal(98, 1.2, n_normal).clip(95, 100)
    temp_normal = np.random.normal(36.7, 0.3, n_normal).clip(36.2, 37.3)
    sys_normal = np.random.normal(122, 10, n_normal).clip(105, 138)
    dia_normal = np.random.normal(78, 6, n_normal).clip(65, 88)
    flow_normal = np.random.normal(300, 20, n_normal).clip(250, 380)
    press_normal = np.random.normal(120, 15, n_normal).clip(90, 150)
    target_normal = ["LOW"] * n_normal

    # 2. Moderate Risk Profiles
    mask_mod_brady = np.random.rand(n_moderate) > 0.5
    hr_mod = np.where(mask_mod_brady, np.random.normal(55, 4, n_moderate), np.random.normal(105, 6, n_moderate)).clip(50, 115)
    spo2_mod = np.random.normal(93.5, 1.5, n_moderate).clip(90.0, 94.9)
    temp_mod = np.random.normal(37.8, 0.4, n_moderate).clip(37.4, 38.3)
    
    mask_mod_hypo = np.random.rand(n_moderate) > 0.5
    sys_mod = np.where(mask_mod_hypo, np.random.normal(95, 5, n_moderate), np.random.normal(155, 8, n_moderate)).clip(90, 165)
    dia_mod = np.random.normal(88, 8, n_moderate).clip(55, 100)
    flow_mod = np.random.normal(230, 25, n_moderate).clip(180, 260)
    press_mod = np.random.normal(170, 15, n_moderate).clip(151, 190)
    target_mod = ["MODERATE"] * n_moderate

    # 3. High Risk Profiles
    mask_high_brady = np.random.rand(n_high) > 0.5
    hr_high = np.where(mask_high_brady, np.random.normal(42, 5, n_high), np.random.normal(135, 10, n_high)).clip(35, 160)
    spo2_high = np.random.normal(86, 4, n_high).clip(70.0, 89.9)
    
    mask_high_fever = np.random.rand(n_high) > 0.5
    temp_high = np.where(mask_high_fever, np.random.normal(38.8, 0.6, n_high), np.random.normal(35.0, 0.4, n_high)).clip(34.0, 40.5)
    
    mask_high_hypo = np.random.rand(n_high) > 0.5
    sys_high = np.where(mask_high_hypo, np.random.normal(78, 6, n_high), np.random.normal(185, 12, n_high)).clip(65, 210)
    dia_high = np.random.normal(50, 12, n_high).clip(35, 120)
    flow_high = np.random.normal(140, 30, n_high).clip(60, 180)
    press_high = np.random.normal(225, 25, n_high).clip(195, 290)
    target_high = ["HIGH"] * n_high

    # Combine
    df = pd.DataFrame({
        "heart_rate": np.concatenate([hr_normal, hr_mod, hr_high]),
        "spo2": np.concatenate([spo2_normal, spo2_mod, spo2_high]),
        "temperature": np.concatenate([temp_normal, temp_mod, temp_high]),
        "systolic_bp": np.concatenate([sys_normal, sys_mod, sys_high]),
        "diastolic_bp": np.concatenate([dia_normal, dia_mod, dia_high]),
        "blood_flow_rate": np.concatenate([flow_normal, flow_mod, flow_high]),
        "dialysis_pressure": np.concatenate([press_normal, press_mod, press_high]),
        "age": ages,
        "risk_level": np.concatenate([target_normal, target_mod, target_high])
    })

    # Shuffle
    df = df.sample(frac=1, random_state=random_state).reset_index(drop=True)
    return df

def train_and_export_model(output_path="ml/dialysis_risk_model.joblib"):
    print("Generating synthetic clinical dialysis dataset...")
    df = generate_synthetic_dialysis_data(n_samples=6000)
    
    feature_cols = [
        "heart_rate", "spo2", "temperature", "systolic_bp", 
        "diastolic_bp", "blood_flow_rate", "dialysis_pressure", "age"
    ]
    
    X = df[feature_cols]
    y = df["risk_level"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print("Training Random Forest Classifier with calibrated class weights...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_split=4,
        random_state=42,
        class_weight="balanced"
    )
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Model Accuracy on Test Set: {acc * 100:.2f}%")
    print("\nClassification Report:\n", classification_report(y_test, y_pred))
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    payload = {
        "model": model,
        "features": feature_cols,
        "classes": model.classes_.tolist()
    }
    joblib.dump(payload, output_path)
    print(f"Model artifact successfully saved to: {output_path}")
    return output_path

if __name__ == "__main__":
    train_and_export_model()
