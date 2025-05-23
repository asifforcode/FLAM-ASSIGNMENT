import React from 'react';

const PRIORITY_CATEGORIES = [
  { value: 'high', label: 'High Priority', color: 'bg-red-100 text-red-800' },
  { value: 'medium', label: 'Medium Priority', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'low', label: 'Low Priority', color: 'bg-green-100 text-green-800' },
];

const SearchBar = ({ searchTerm, category, onSearchChange, onCategoryChange }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-4 p-4 bg-white rounded-lg shadow-sm">
      <div className="flex-1">
        <input
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
      </div>
      <div className="sm:w-48">
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white transition-all"
        >
          <option value="">All Priorities</option>
          {PRIORITY_CATEGORIES.map((cat) => (
            <option 
              key={cat.value} 
              value={cat.value}
              className={cat.color}
            >
              {cat.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SearchBar; 