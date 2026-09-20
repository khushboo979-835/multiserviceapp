import React, { useState } from "react";
import { Settings, Plus, Edit3, Trash2, ShieldCheck, ChevronRight, Check, Layers } from "lucide-react";

interface FormFieldAdmin {
  id: string;
  label: string;
  type: string;
  required: boolean;
}

interface SubcategoryAdmin {
  id: string;
  name: string;
  basePrice: number;
  fieldsCount: number;
  fields: FormFieldAdmin[];
}

interface CategoryAdmin {
  id: string;
  name: string;
  subcategories: SubcategoryAdmin[];
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<CategoryAdmin[]>([
    {
      id: "cat_mobile",
      name: "Mobile Repair",
      subcategories: [
        {
          id: "sub_mob_doorstep",
          name: "Doorstep Mobile Repair",
          basePrice: 499,
          fieldsCount: 5,
          fields: [
            { id: "device_model", label: "Device Model", type: "TEXT", required: true },
            { id: "repair_type", label: "Repair Type", type: "SELECT", required: true },
            { id: "preferred_date", label: "Visit Date", type: "DATE", required: true },
            { id: "preferred_time", label: "Visit Time Slot", type: "TIME_SLOT", required: true },
            { id: "service_address", label: "Address GPS", type: "ADDRESS_GPS", required: true },
          ],
        },
      ],
    },
    {
      id: "cat_parlor",
      name: "Home Parlor / Salon",
      subcategories: [
        {
          id: "sub_parlor_female",
          name: "Salon Classic for Women",
          basePrice: 799,
          fieldsCount: 4,
          fields: [
            { id: "services_select", label: "Choose Services", type: "MULTI_SELECT", required: true },
            { id: "preferred_date", label: "Booking Date", type: "DATE", required: true },
            { id: "preferred_time", label: "Preferred Time", type: "TIME_SLOT", required: true },
            { id: "service_address", label: "Your Address", type: "ADDRESS_GPS", required: true },
          ],
        },
      ],
    },
    {
      id: "cat_utility",
      name: "Home Utilities",
      subcategories: [
        {
          id: "sub_utility_ac",
          name: "AC Servicing & Repair",
          basePrice: 399,
          fieldsCount: 5,
          fields: [
            { id: "ac_type", label: "AC Type", type: "SELECT", required: true },
            { id: "service_type", label: "Required Service", type: "SELECT", required: true },
            { id: "preferred_date", label: "Booking Date", type: "DATE", required: true },
            { id: "preferred_time", label: "Preferred Time", type: "TIME_SLOT", required: true },
            { id: "service_address", label: "Address GPS", type: "ADDRESS_GPS", required: true },
          ],
        },
      ],
    },
  ]);

  const [selectedSub, setSelectedSub] = useState<SubcategoryAdmin | null>(categories[0].subcategories[0]);
  const [editingPrice, setEditingPrice] = useState<number | null>(categories[0].subcategories[0].basePrice);

  const handleSelectSub = (sub: SubcategoryAdmin) => {
    setSelectedSub(sub);
    setEditingPrice(sub.basePrice);
  };

  const handleSavePrice = () => {
    if (!selectedSub || editingPrice === null) return;

    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        subcategories: cat.subcategories.map((sub) =>
          sub.id === selectedSub.id ? { ...sub, basePrice: editingPrice } : sub
        ),
      }))
    );
    setSelectedSub((prev) => (prev ? { ...prev, basePrice: editingPrice } : null));
    alert("Base price updated successfully in metadata configs.");
  };

  const handleAddField = () => {
    if (!selectedSub) return;
    const newField: FormFieldAdmin = {
      id: `field_${Date.now()}`,
      label: "New Form Field",
      type: "TEXT",
      required: false,
    };

    const updatedFields = [...selectedSub.fields, newField];

    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        subcategories: cat.subcategories.map((sub) =>
          sub.id === selectedSub.id
            ? { ...sub, fields: updatedFields, fieldsCount: updatedFields.length }
            : sub
        ),
      }))
    );
    setSelectedSub((prev) =>
      prev
        ? {
            ...prev,
            fields: updatedFields,
            fieldsCount: updatedFields.length,
          }
        : null
    );
  };

  const handleDeleteField = (fieldId: string) => {
    if (!selectedSub) return;
    const updatedFields = selectedSub.fields.filter((f) => f.id !== fieldId);

    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        subcategories: cat.subcategories.map((sub) =>
          sub.id === selectedSub.id
            ? { ...sub, fields: updatedFields, fieldsCount: updatedFields.length }
            : sub
        ),
      }))
    );
    setSelectedSub((prev) =>
      prev
        ? {
            ...prev,
            fields: updatedFields,
            fieldsCount: updatedFields.length,
          }
        : null
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <Layers className="text-indigo-400" size={24} />
            Catalog & Form Manager
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure dynamic booking form schemas and service base rates
          </p>
        </div>
      </div>

      {/* Main Responsive Split View */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Categories List */}
        <div className="w-full lg:w-1/2 bg-[#0f172a] border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl space-y-4 sm:space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white">Categories & Services</h3>
              <p className="text-xs text-slate-400">Select a service to configure</p>
            </div>
          </div>

          <div className="space-y-4">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-[#020617] border border-slate-800/80 rounded-2xl p-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                  {cat.name}
                </h4>
                <div className="space-y-2">
                  {cat.subcategories.map((sub) => {
                    const isSelected = selectedSub?.id === sub.id;
                    return (
                      <div
                        key={sub.id}
                        onClick={() => handleSelectSub(sub)}
                        className={`flex justify-between items-center px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? "bg-indigo-950/30 border-indigo-500 text-white shadow-md shadow-indigo-600/10"
                            : "bg-[#0f172a] border-slate-800/80 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold">{sub.name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {sub.fieldsCount} Dynamic Form Fields
                          </p>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="text-xs font-extrabold text-white">₹{sub.basePrice}</span>
                          <ChevronRight size={14} className="text-slate-500" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Subcategory Configuration */}
        <div className="w-full lg:w-1/2 bg-[#0f172a] border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl space-y-6">
          {selectedSub ? (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-white">{selectedSub.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Base Rate & Form Schema Config</p>
                </div>
                <Settings size={18} className="text-indigo-400" />
              </div>

              {/* Pricing */}
              <div>
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                  Service Base Rate
                </h4>
                <div className="bg-[#020617] border border-slate-800 p-4 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Base Price (₹)</p>
                    <input
                      type="number"
                      value={editingPrice ?? ""}
                      onChange={(e) => setEditingPrice(parseInt(e.target.value) || 0)}
                      className="bg-transparent text-white text-lg font-extrabold focus:outline-none w-full mt-1 border-b border-slate-800 focus:border-indigo-500 pb-1"
                    />
                  </div>
                  <button
                    onClick={handleSavePrice}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/15 transition"
                  >
                    <Check size={14} />
                    Save Rate
                  </button>
                </div>
              </div>

              {/* Dynamic form field list */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
                    Customer Form Parameters ({selectedSub.fields.length})
                  </h4>
                  <button
                    onClick={handleAddField}
                    className="text-xs font-extrabold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <Plus size={14} />
                    + Add Field
                  </button>
                </div>

                <div className="space-y-2.5">
                  {selectedSub.fields.map((field) => (
                    <div
                      key={field.id}
                      className="bg-[#020617] border border-slate-800/80 p-3 rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                        <div className="truncate">
                          <p className="text-white font-bold truncate">{field.label}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-mono">
                            Type: {field.type} • {field.required ? "Required" : "Optional"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteField(field.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-sm">
              Select a service from the left to view parameters
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
