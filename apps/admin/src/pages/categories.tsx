import React, { useState } from "react";
import { Settings, Plus, Edit3, Trash2, ShieldCheck, ChevronRight, Check } from "lucide-react";

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
            { id: "service_address", label: "Address GPS", type: "ADDRESS_GPS", required: true }
          ]
        }
      ]
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
            { id: "service_address", label: "Your Address", type: "ADDRESS_GPS", required: true }
          ]
        }
      ]
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
            { id: "service_address", label: "Address GPS", type: "ADDRESS_GPS", required: true }
          ]
        }
      ]
    }
  ]);

  const [selectedSub, setSelectedSub] = useState<SubcategoryAdmin | null>(null);
  const [editingPrice, setEditingPrice] = useState<number | null>(null);

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
        )
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
        )
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
        )
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
    <div className="p-8 flex gap-8 h-[calc(100vh-4rem)]">
      {/* Categories & Subcategories Tree */}
      <div className="flex-1 bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col overflow-hidden">
        <div className="mb-6">
          <h2 className="text-xl font-extrabold text-white">Marketplace Catalog</h2>
          <p className="text-2xs text-slate-400 mt-0.5">Select a subcategory to manage pricing & forms</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {categories.map((cat) => (
            <div key={cat.id}>
              <h3 className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest mb-3">{cat.name}</h3>
              <div className="space-y-2">
                {cat.subcategories.map((sub) => {
                  const isSelected = selectedSub?.id === sub.id;
                  return (
                    <div
                      key={sub.id}
                      onClick={() => handleSelectSub(sub)}
                      className={`flex justify-between items-center px-4 py-3.5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "bg-indigo-950/20 border-indigo-500 text-white"
                          : "bg-[#020617] border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold">{sub.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{sub.fieldsCount} Dynamic Form Fields</p>
                      </div>
                      <div className="flex items-center gap-3">
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

      {/* Selected Subcategory Editor Panel */}
      <div className="w-1/2 bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col overflow-hidden">
        {selectedSub ? (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header info */}
            <div className="border-b border-slate-800 pb-5 mb-6 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-lg text-white">{selectedSub.name}</h3>
                <p className="text-2xs text-slate-400 mt-0.5">Parameters Configuration</p>
              </div>
              <Settings size={18} className="text-slate-500" />
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              {/* Pricing section */}
              <div>
                <h4 className="text-2xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">Service Pricing</h4>
                <div className="bg-[#020617] border border-slate-800 p-4.5 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Base Rate (₹)</p>
                    <input
                      type="number"
                      value={editingPrice ?? ""}
                      onChange={(e) => setEditingPrice(parseInt(e.target.value))}
                      className="bg-transparent text-white text-lg font-extrabold focus:outline-none w-full mt-1 border-b border-slate-800 focus:border-indigo-500 pb-1"
                    />
                  </div>
                  <button
                    onClick={handleSavePrice}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-2xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/15"
                  >
                    <Check size={14} />
                    Save Rate
                  </button>
                </div>
              </div>

              {/* Dynamic form field list */}
              <div className="flex-col flex-1">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-2xs font-extrabold text-slate-400 uppercase tracking-widest">Dynamic Form Parameters</h4>
                  <button
                    onClick={handleAddField}
                    className="text-2xs font-extrabold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <Plus size={14} />
                    Add Parameter
                  </button>
                </div>

                <div className="space-y-3">
                  {selectedSub.fields.map((field) => (
                    <div
                      key={field.id}
                      className="bg-[#020617] border border-slate-800 px-4 py-3.5 rounded-2xl flex items-center justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{field.label}</p>
                        <p className="text-[9px] font-semibold text-slate-500 mt-0.5 uppercase tracking-wider">
                          Type: {field.type} • {field.required ? "Required" : "Optional"}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteField(field.id)}
                        className="w-8 h-8 rounded-xl bg-rose-950/20 text-rose-500 border border-rose-500/20 flex items-center justify-center hover:bg-rose-900/30 transition"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center py-20 text-center">
            <Settings size={36} className="text-slate-600 mb-4" />
            <h4 className="text-white font-bold text-base">No Subcategory Selected</h4>
            <p className="text-dark-400 text-xs mt-1.5 max-w-[280px] leading-relaxed">
              Select any subcategory item from the catalog tree layout to inspect configurations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
