import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

const toLocalDateTime = (value) => {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};

const categories = [
  "Music",
  "Conference",
  "Workshop",
  "Sports",
  "Theater",
  "Food & Drink",
  "Art",
  "Technology",
  "Business",
  "Other",
];

function EventForm({ initialData, isEditing }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    eventDate: "",
    ticketPrice: "",
    totalSeats: "",
    imageUrl: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        category: initialData.category || "",
        location: initialData.location || "",
        eventDate: initialData.eventDate
          ? toLocalDateTime(initialData.eventDate)
          : "",
        ticketPrice: initialData.ticketPrice ?? "",
        totalSeats: initialData.totalSeats || "",
        imageUrl: initialData.imageUrl || "",
      });
      if (initialData.imageUrl) {
        setImagePreview(initialData.imageUrl);
      }
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFormData((prev) => ({
        ...prev,
        eventDate: toLocalDateTime(tomorrow),
      }));
    }
  }, [initialData]);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    else if (formData.title.trim().length < 3)
      newErrors.title = "Title must be at least 3 characters";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    else if (formData.description.trim().length < 20)
      newErrors.description = "Description must be at least 20 characters";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.eventDate) newErrors.eventDate = "Event date is required";
    else if (new Date(formData.eventDate) <= new Date())
      newErrors.eventDate = "Event date must be in the future";
    if (formData.ticketPrice === "" || formData.ticketPrice === null)
      newErrors.ticketPrice = "Ticket price is required";
    else if (parseFloat(formData.ticketPrice) < 0)
      newErrors.ticketPrice = "Ticket price must be positive";
    if (!formData.totalSeats) newErrors.totalSeats = "Total seats is required";
    else if (parseInt(formData.totalSeats) < 1)
      newErrors.totalSeats = "Must have at least 1 seat";
    else if (parseInt(formData.totalSeats) > 100000)
      newErrors.totalSeats = "Maximum 100,000 seats";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
        setFormData((prev) => ({ ...prev, imageUrl: event.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        location: formData.location.trim(),
        eventDate: new Date(formData.eventDate).toISOString(),
        ticketPrice: parseFloat(formData.ticketPrice),
        totalSeats: parseInt(formData.totalSeats),
        imageUrl: formData.imageUrl || null,
      };

      if (isEditing) {
        await api.put(`/events/${id}`, eventData);
        toast.success("Event updated successfully");
      } else {
        await api.post("/events", eventData);
        toast.success("Event created successfully");
      }
      navigate("/admin/events");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (isEditing ? "Failed to update event" : "Failed to create event");
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/events");
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary-900">
          {isEditing ? "Edit Event" : "Create New Event"}
        </h1>
        <p className="text-secondary-600 mt-1">
          {isEditing
            ? "Update event details"
            : "Fill in the details to create a new event"}
        </p>
      </div>

      <div className="card p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <label htmlFor="title" className="label">
              Event Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`input ${errors.title ? "input-error" : ""}`}
              placeholder="Enter event title"
              disabled={submitting}
              aria-invalid={errors.title ? "true" : "false"}
              aria-describedby={errors.title ? "title-error" : undefined}
            />
            {errors.title && (
              <p
                id="title-error"
                className="mt-1.5 text-sm text-red-600"
                role="alert"
              >
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="label">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`input ${errors.description ? "input-error" : ""} resize-y`}
              placeholder="Describe your event in detail..."
              disabled={submitting}
              aria-invalid={errors.description ? "true" : "false"}
              aria-describedby={
                errors.description ? "description-error" : undefined
              }
            />
            {errors.description && (
              <p
                id="description-error"
                className="mt-1.5 text-sm text-red-600"
                role="alert"
              >
                {errors.description}
              </p>
            )}
            <p className="mt-1 text-sm text-secondary-500">
              Minimum 20 characters
            </p>
          </div>

          <div>
            <label htmlFor="category" className="label">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`input ${errors.category ? "input-error" : ""}`}
              disabled={submitting}
              aria-invalid={errors.category ? "true" : "false"}
              aria-describedby={errors.category ? "category-error" : undefined}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p
                id="category-error"
                className="mt-1.5 text-sm text-red-600"
                role="alert"
              >
                {errors.category}
              </p>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="location" className="label">
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={`input ${errors.location ? "input-error" : ""}`}
                placeholder="Venue, City, Country"
                disabled={submitting}
                aria-invalid={errors.location ? "true" : "false"}
                aria-describedby={
                  errors.location ? "location-error" : undefined
                }
              />
              {errors.location && (
                <p
                  id="location-error"
                  className="mt-1.5 text-sm text-red-600"
                  role="alert"
                >
                  {errors.location}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="eventDate" className="label">
                Date & Time *
              </label>
              <input
                type="datetime-local"
                id="eventDate"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleChange}
                className={`input ${errors.eventDate ? "input-error" : ""}`}
                min={new Date().toISOString().slice(0, 16)}
                disabled={submitting}
                aria-invalid={errors.eventDate ? "true" : "false"}
                aria-describedby={
                  errors.eventDate ? "eventDate-error" : undefined
                }
              />
              {errors.eventDate && (
                <p
                  id="eventDate-error"
                  className="mt-1.5 text-sm text-red-600"
                  role="alert"
                >
                  {errors.eventDate}
                </p>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="ticketPrice" className="label">
                Ticket Price ($) *
              </label>
              <input
                type="number"
                id="ticketPrice"
                name="ticketPrice"
                value={formData.ticketPrice}
                onChange={handleChange}
                className={`input ${errors.ticketPrice ? "input-error" : ""}`}
                placeholder="0.00"
                step="0.01"
                min="0"
                disabled={submitting}
                aria-invalid={errors.ticketPrice ? "true" : "false"}
                aria-describedby={
                  errors.ticketPrice ? "ticketPrice-error" : undefined
                }
              />
              {errors.ticketPrice && (
                <p
                  id="ticketPrice-error"
                  className="mt-1.5 text-sm text-red-600"
                  role="alert"
                >
                  {errors.ticketPrice}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="totalSeats" className="label">
                Total Seats *
              </label>
              <input
                type="number"
                id="totalSeats"
                name="totalSeats"
                value={formData.totalSeats}
                onChange={handleChange}
                className={`input ${errors.totalSeats ? "input-error" : ""}`}
                placeholder="100"
                min="1"
                max="100000"
                disabled={submitting}
                aria-invalid={errors.totalSeats ? "true" : "false"}
                aria-describedby={
                  errors.totalSeats ? "totalSeats-error" : undefined
                }
              />
              {errors.totalSeats && (
                <p
                  id="totalSeats-error"
                  className="mt-1.5 text-sm text-red-600"
                  role="alert"
                >
                  {errors.totalSeats}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="label">Event Image</label>
            <div className="border-2 border-dashed border-secondary-300 rounded-lg p-6">
              <input
                type="file"
                id="imageUrl"
                name="imageUrl"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={submitting}
              />
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-48 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData((prev) => ({ ...prev, imageUrl: "" }));
                    }}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                    aria-label="Remove image"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <label htmlFor="imageUrl" className="cursor-pointer">
                    <svg
                      className="mx-auto w-12 h-12 text-secondary-300 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-secondary-600 mb-2">
                      Click to upload an event image
                    </p>
                    <p className="text-sm text-secondary-500">
                      PNG, JPG up to 5MB
                    </p>
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-secondary-200">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-secondary flex-1"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  {isEditing ? "Updating..." : "Creating..."}
                </span>
              ) : isEditing ? (
                "Update Event"
              ) : (
                "Create Event"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventForm;
