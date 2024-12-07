import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchBrandsById, updateBrand } from "../../../store/slices/admin/brands/brands.js";
import styles from "./UpdateBrands.module.scss";

const UpdateBrand = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { loading, error, brand } = useSelector((state) => state.brands);

    const [name, setName] = useState(""); // Состояние для имени бренда
    const [photo, setPhoto] = useState(null); // Состояние для нового фото
    const [preview, setPreview] = useState(null); // Превью (локально загруженного или существующего фото)

    useEffect(() => {
        if (id) {
            dispatch(fetchBrandsById(id))
                .unwrap()
                .then((fetchedBrand) => {
                    setName(fetchedBrand.name || ""); // Заполняем имя из API
                    setPreview(fetchedBrand.photo || null); // Если фото уже есть, заполняем его
                })
                .catch((err) => console.error("Ошибка загрузки бренда:", err));
        }
    }, [id, dispatch]);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(file); // Устанавливаем новое фото
            setPreview(URL.createObjectURL(file)); // Показываем превью для нового фото
        }
    };

    const handleRemovePhoto = () => {
        setPhoto(null); // Удаляем локально загруженное фото
        setPreview(null); // Сбрасываем превью
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!name.trim()) {
            alert("Введите имя бренда");
            return;
        }

        const formData = new FormData();
        formData.append("name", name.trim()); // Убедимся, что имя очищено от лишних пробелов

        if (photo) {
            formData.append("photo", photo); // Добавляем новое фото, если оно загружено
        }

        dispatch(updateBrand({ brandId: id, formData }))
            .unwrap()
            .then(() => {
                alert("Бренд успешно обновлен!");
            })
            .catch((err) => {
                console.error("Ошибка обновления бренда:", err);
                alert("Не удалось обновить бренд.");
            });
    };

    if (loading && !name) return <p>Загрузка...</p>;

    return (
        <form onSubmit={handleSubmit} className={styles.container}>
            <div className={styles.field}>
                <label htmlFor="name">Имя клиента</label>
                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Имя клиента"
                />
                {!name.trim() && <span className={styles.validation}>*Введите имя клиента</span>}
            </div>
            <div className={styles.field}>
                <label>Логотип</label>
                <div className={styles.photo}>
                    {preview ? (
                        <div className={styles.photoPreviewContainer}>
                            <img src={preview} alt="Preview" className={styles.photoPreview} />
                            <button
                                type="button"
                                onClick={handleRemovePhoto}
                                className={styles.removePhotoButton}
                            >
                                Удалить
                            </button>
                        </div>
                    ) : (
                        <div className={styles.photoPlaceholder}>
                            <input
                                id="photoInput"
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                style={{ display: "none" }}
                            />
                            <button
                                type="button"
                                onClick={() => document.getElementById("photoInput").click()}
                                className={styles.addPhotoButton}
                            >
                                +
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div className={styles.buttons}>
                <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => window.history.back()}
                >
                    Закрыть
                </button>
                <button type="submit" className={styles.submitButton} disabled={loading}>
                    {loading ? "Обновление..." : "Сохранить"}
                </button>
            </div>
            {error && <p className={styles.error}>Ошибка: {error}</p>}
        </form>
    );
};

export default UpdateBrand;
