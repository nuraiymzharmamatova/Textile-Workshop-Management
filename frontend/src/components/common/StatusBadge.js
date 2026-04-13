import React from 'react';
import { useTranslation } from 'react-i18next';

const statusConfig = {
  NEW: { label: { en: 'New', ru: 'Новый', kg: 'Жаңы' }, bg: 'bg-gray-100', text: 'text-gray-700' },
  IN_PROGRESS: { label: { en: 'In Progress', ru: 'В работе', kg: 'Иштелүүдө' }, bg: 'bg-blue-100', text: 'text-blue-700' },
  CUTTING: { label: { en: 'Cutting', ru: 'Раскрой', kg: 'Кесүү' }, bg: 'bg-indigo-100', text: 'text-indigo-700' },
  SEWING: { label: { en: 'Sewing', ru: 'Пошив', kg: 'Тигүү' }, bg: 'bg-pink-100', text: 'text-pink-700' },
  PACKAGING: { label: { en: 'Packaging', ru: 'Упаковка', kg: 'Таңгактоо' }, bg: 'bg-purple-100', text: 'text-purple-700' },
  SHIPPED: { label: { en: 'Shipped', ru: 'Отправлен', kg: 'Жөнөтүлдү' }, bg: 'bg-cyan-100', text: 'text-cyan-700' },
  COMPLETED: { label: { en: 'Completed', ru: 'Завершён', kg: 'Аяктады' }, bg: 'bg-green-100', text: 'text-green-700' },
  CANCELLED: { label: { en: 'Cancelled', ru: 'Отменён', kg: 'Жокко чыгарылды' }, bg: 'bg-red-100', text: 'text-red-700' },
  ACTIVE: { label: { en: 'Active', ru: 'Активен', kg: 'Активдүү' }, bg: 'bg-green-100', text: 'text-green-700' },
  INACTIVE: { label: { en: 'Inactive', ru: 'Неактивен', kg: 'Активдүү эмес' }, bg: 'bg-gray-100', text: 'text-gray-500' },
};

export function getStatusLabel(status, lang) {
  const config = statusConfig[status] || statusConfig.NEW;
  return config.label[lang] || config.label.ru;
}

export default function StatusBadge({ status }) {
  const { i18n } = useTranslation();
  const lang = i18n.language || 'ru';
  const config = statusConfig[status] || statusConfig.NEW;
  const label = config.label[lang] || config.label.ru;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      {label}
    </span>
  );
}
