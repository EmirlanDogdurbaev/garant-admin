import styles from "./CreateProduct.module.scss";
import {useEffect, useState} from "react";
import axios from "axios";
import {API_URI} from "../../../store/api/api.js";
import Select from "react-select";
import {customStyles} from "../../AllDiscounts/ModifySpecialOffer/ModifySpecialOffer.jsx";
import {useDispatch, useSelector} from "react-redux";
import {fetchAllCollections} from "../../../store/slices/admin/collections/collections.js";
import {fetchCategories} from "../../../store/slices/getCategories.js";
import {useNavigate} from "react-router-dom";

const CreateProduct = () => {
    const dispatch = useDispatch();
    const categoriesList = useSelector((state) => state.categories.categories);
    const collectionsList = useSelector((state) => state.collections.data);
    const [photos, setPhotos] = useState([]);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const navigate = useNavigate();

    const [formState, setFormState] = useState({
        price: 0,
        isPainted: false,
        isPopular: true,
        isProducer: true,
        isAqua: false,
        isGarant: false,
        isNew: true,
        category_id: null,
        collection_id: null,
        items: [
            {name: "", description: "", language_code: "ru"},
            {name: "", description: "", language_code: "kgz"},
            {name: "", description: "", language_code: "en"},
        ],
    });

    useEffect(() => {
        dispatch(fetchAllCollections());
        dispatch(fetchCategories());
    }, [dispatch]);

    const handleFormChange = (field, value) => {
        setFormState((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleCollectionChange = (index, field, value) => {
        const updatedItems = [...formState.items];
        updatedItems[index][field] = value;
        setFormState((prev) => ({
            ...prev,
            items: updatedItems,
        }));
    };

    const handleAddPhoto = () => {
        setPhotos((prevPhotos) => [
            ...prevPhotos,
            {file: null, isMain: false, hashColor: "#ffffff"},
        ]);
    };

    const handleFileChange = (index, file) => {
        const updatedPhotos = [...photos];
        const fileName = file.name;
        const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
        const baseName = fileName.substring(0, fileName.lastIndexOf('.'));


        let newFileName = fileName;
        let counter = 1;

        while (updatedPhotos.some(photo => photo.file?.name === newFileName)) {
            newFileName = `${baseName}_${counter}${fileExtension}`;
            counter++;
        }

        const renamedFile = new File([file], newFileName, {type: file.type});
        updatedPhotos[index].file = renamedFile;
        setPhotos(updatedPhotos);
    };

    const handleExclusiveToggle = (field) => {
        setFormState((prev) => ({
            ...prev,
            isProducer: false,
            isAqua: false,
            isGarant: false,
            [field]: true,
        }));

        console.log(formState)
    };


    const handlePhotoFieldChange = (index, field, value) => {
        const updatedPhotos = [...photos];
        updatedPhotos[index][field] = value;
        setPhotos(updatedPhotos);
    };

    const handleRemovePhoto = (index) => {
        setPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();

        // Добавляем данные формы
        formData.append(
            "item",
            JSON.stringify({
                price: formState.price,
                isProducer: formState.isProducer, // Производитель
                isAqua: formState.isAqua,         // Водный
                isGarant: formState.isGarant,     // Гарантированный
                isPainted: formState.isPainted,
                is_popular: formState.isPopular,
                is_new: formState.isNew,
                items: formState.items,
                collection_id: formState.collection_id,
                category_id: formState.category_id,
                size: "M",
            })
        );

        // Обработка фотографий
        photos.forEach((photo) => {
            if (photo.file) {
                formData.append(`photos`, photo.file);
                formData.append(`isMain_${photo.file.name}`, photo.isMain);
                formData.append(`hashColor_${photo.file.name}`, photo.hashColor);
            }
        });

        try {
            // Отправка данных на сервер
            await axios.post(`${API_URI}/items`, formData, {
                headers: {"Content-Type": "multipart/form-data"},
            });

            // Уведомление об успешной операции
            setSuccessMessage("Продукт успешно добавлен!");

            // Сброс состояния формы
            setFormState({
                price: "",
                isProducer: true, // По умолчанию "Производитель"
                isAqua: false,
                isGarant: false,
                isPainted: false,
                isPopular: true,
                isNew: true,
                category_id: null,
                collection_id: null,
                items: [
                    {name: "", description: "", language_code: "ru"},
                    {name: "", description: "", language_code: "kgz"},
                    {name: "", description: "", language_code: "en"},
                ],
            });

            setPhotos([]);

            setTimeout(() => setSuccessMessage(""), 3000);
            navigate("/admin/all-products");
        } catch (err) {
            setError(err.response?.data || "Ошибка при создании товара.");
            console.error("Ошибка:", err);
        }
    };


    return (
        <div className={styles.AddCollection}>
            <div className={styles.inner}>
                <section className={styles.title}>
                    <h2>Коллекции / добавить товар</h2>
                    <div className={styles.line}></div>
                </section>

                {successMessage && (
                    <div className={styles.successMessage}>
                        <p>{successMessage}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className={styles.select_section}>
                        <h3>Выберите категорию</h3>
                        <Select
                            options={categoriesList.map((category) => ({
                                value: category.id,
                                label: category.name,
                            }))}
                            styles={customStyles}
                            name="category"
                            placeholder="Выберите категорию"
                            onChange={(selectedOption) =>
                                handleFormChange("category_id", selectedOption.value)
                            }
                        />
                    </div>

                    <div className={styles.select_section}>
                        <h3>Выберите коллекцию</h3>
                        <Select
                            options={collectionsList.map((collection) => ({
                                value: collection.ID,
                                label: collection.name,
                            }))}
                            styles={customStyles}
                            name="collection"
                            placeholder="Выберите коллекцию"
                            onChange={(selectedOption) =>
                                handleFormChange("collection_id", selectedOption.value)
                            }
                        />
                    </div>


                    {formState.items.map((item, index) => (
                        <section key={index} className={styles.info_container}>
                            <h4>
                                {item.language_code === "ru"
                                    ? "Русский"
                                    : item.language_code === "kgz"
                                        ? "Кыргызча"
                                        : "English"}
                            </h4>
                            <label>
                                <h5>Название</h5>
                                <input
                                    type="text"
                                    placeholder="Название"
                                    required
                                    value={item.name}
                                    onChange={(e) =>
                                        handleCollectionChange(index, "name", e.target.value)
                                    }
                                />
                            </label>
                            <label className={styles.priceLabel}>
                                <h5>Цена</h5>
                                <input
                                    type="number"
                                    placeholder="Введите цену"
                                    required
                                    value={formState.price}
                                    onChange={(e) =>
                                        handleFormChange("price", parseFloat(e.target.value))
                                    }
                                />
                            </label>

                            <label>
                                <h5>Описание</h5>
                                <textarea
                                    placeholder="Описание"
                                    required
                                    value={item.description}
                                    onChange={(e) =>
                                        handleCollectionChange(index, "description", e.target.value)
                                    }
                                />
                            </label>
                        </section>
                    ))}

                    <div className={styles.filters}>
                        <div className={styles.group}>
                            <h5>Производство</h5>
                            <label>
                                <input
                                    type="radio"
                                    name="exclusive"
                                    value="isProducer"
                                    checked={formState.isProducer}
                                    onChange={() => handleExclusiveToggle("isProducer")}
                                />
                                Производитель
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="exclusive"
                                    value="isAqua"
                                    checked={formState.isAqua}
                                    onChange={() => handleExclusiveToggle("isAqua")}
                                />
                                Водный
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="exclusive"
                                    value="isGarant"
                                    checked={formState.isGarant}
                                    onChange={() => handleExclusiveToggle("isGarant")}
                                />
                                Гарантированный
                            </label>
                        </div>

                        <div className={styles.group}>
                            <h5>Дополнительно</h5>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formState.isPopular}
                                    onChange={() =>
                                        handleFormChange("isPopular", !formState.isPopular)
                                    }
                                />
                                Популярный товар
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formState.isNew}
                                    onChange={() => handleFormChange("isNew", !formState.isNew)}
                                />
                                Новый товар (новинка)
                            </label>
                        </div>
                    </div>

                    <div className={styles.photos}>
                        <p>Фотографии</p>
                        <div className={styles.grid}>
                            {photos.map((photo, index) => (
                                <div key={index} className={styles.cardWrapper}>
                                    <div className={styles.card} style={{height: "300px", width: "300px"}}>
                                        {photo.file ? (
                                            <img
                                                src={URL.createObjectURL(photo.file)}
                                                alt={`Фото ${index + 1}`}
                                            />
                                        ) : (
                                            <input
                                                style={{height: "300px", width: "300px"}}
                                                type="file"
                                                onChange={(e) => handleFileChange(index, e.target.files[0])}
                                            />
                                        )}
                                    </div>
                                    <div className={styles.colors}>
                                        <label>
                                            <input
                                                type="radio"
                                                name={`main-photo`}
                                                checked={photo.isMain}
                                                onChange={() =>
                                                    handlePhotoFieldChange(index, "isMain", true)
                                                }
                                            />
                                            Главная
                                        </label>
                                        <input
                                            type="color"
                                            value={photo.hashColor}
                                            onChange={(e) =>
                                                handlePhotoFieldChange(index, "hashColor", e.target.value)
                                            }
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemovePhoto(index)}
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={handleAddPhoto} style={{height: "300px", width: "300px"}}>
                                Добавить фото
                            </button>
                        </div>
                    </div>

                    <button type="submit" className={styles.saveButton}>
                        Сохранить
                    </button>
                    {error && <p style={{color: "red"}}>{error}</p>}
                </form>
            </div>
        </div>
    );
};

export default CreateProduct;
