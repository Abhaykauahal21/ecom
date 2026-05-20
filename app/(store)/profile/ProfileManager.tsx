"use client";

import { useState } from "react";
import { User, Phone, Mail, MapPin, Plus, Trash2, Edit, CheckCircle2, Package, CreditCard, ChevronRight, Loader2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { updateUserProfile, deleteUserAddress, setUserDefaultAddress, updateUserAddress } from "@/app/actions/user";
import { addAddress } from "@/app/actions/address";
import Link from "next/link";

interface ProfileManagerProps {
  initialUser: any;
}

export default function ProfileManager({ initialUser }: ProfileManagerProps) {
  const [user, setUser] = useState(initialUser);
  const [activeTab, setActiveTab] = useState<"profile" | "addresses" | "orders">("profile");

  // Profile Form States
  const [profileName, setProfileName] = useState(user.name || "");
  const [profilePhone, setProfilePhone] = useState(user.phone || "");
  const [profileLoading, setProfileLoading] = useState(false);

  // Address Form States
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressName, setAddressName] = useState("");
  const [addressPhone, setAddressPhone] = useState("");
  const [addressEmail, setAddressEmail] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressState, setAddressState] = useState("");
  const [addressPincode, setAddressPincode] = useState("");
  const [addressIsDefault, setAddressIsDefault] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);

  // General Loading States
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      setProfileLoading(true);
      const res = await updateUserProfile({ name: profileName, phone: profilePhone });
      if (res.success && res.user) {
        setUser((prev: any) => ({ ...prev, name: res.user.name, phone: res.user.phone }));
        toast.success("Profile details updated successfully");
      } else {
        toast.error(res.error || "Failed to update profile");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setProfileLoading(false);
    }
  };

  // Open form for a new address
  const handleNewAddress = () => {
    setEditingAddressId(null);
    setAddressName(user.name || "");
    setAddressPhone(user.phone || "");
    setAddressEmail(user.email || "");
    setAddressLine1("");
    setAddressLine2("");
    setAddressCity("");
    setAddressState("");
    setAddressPincode("");
    setAddressIsDefault(user.addresses.length === 0);
    setShowAddressForm(true);
  };

  // Open form to edit address
  const handleEditAddress = (addr: any) => {
    setEditingAddressId(addr.id);
    setAddressName(addr.name);
    setAddressPhone(addr.phone);
    setAddressEmail(addr.email || "");
    setAddressLine1(addr.line1);
    setAddressLine2(addr.line2 || "");
    setAddressCity(addr.city);
    setAddressState(addr.state);
    setAddressPincode(addr.pincode);
    setAddressIsDefault(addr.isDefault);
    setShowAddressForm(true);
  };

  // Add or Edit Address submit
  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressName.trim() || !addressPhone.trim() || !addressLine1.trim() || !addressCity.trim() || !addressState.trim() || !addressPincode.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setAddressLoading(true);
      if (editingAddressId) {
        // Edit flow
        const res = await updateUserAddress(editingAddressId, {
          name: addressName,
          phone: addressPhone,
          email: addressEmail || undefined,
          line1: addressLine1,
          line2: addressLine2 || undefined,
          city: addressCity,
          state: addressState,
          pincode: addressPincode,
          isDefault: addressIsDefault,
        });

        if (res.success) {
          toast.success("Address updated successfully");
          // Refresh local state
          setUser((prev: any) => {
            const updated = prev.addresses.map((a: any) => {
              if (a.id === editingAddressId) {
                return {
                  ...a,
                  name: addressName,
                  phone: addressPhone,
                  email: addressEmail,
                  line1: addressLine1,
                  line2: addressLine2,
                  city: addressCity,
                  state: addressState,
                  pincode: addressPincode,
                  isDefault: addressIsDefault,
                };
              }
              return addressIsDefault ? { ...a, isDefault: false } : a;
            });
            return { ...prev, addresses: updated };
          });
          setShowAddressForm(false);
        } else {
          toast.error(res.error || "Failed to update address");
        }
      } else {
        // Add flow
        const res = await addAddress({
          name: addressName,
          phone: addressPhone,
          email: addressEmail,
          line1: addressLine1,
          line2: addressLine2 || undefined,
          city: addressCity,
          state: addressState,
          pincode: addressPincode,
          isDefault: addressIsDefault,
        });

        if (res.success && res.address) {
          toast.success("Address added successfully");
          setUser((prev: any) => {
            const updatedList = addressIsDefault
              ? prev.addresses.map((a: any) => ({ ...a, isDefault: false }))
              : prev.addresses;
            return {
              ...prev,
              addresses: [res.address, ...updatedList],
            };
          });
          setShowAddressForm(false);
        } else {
          toast.error(res.error || "Failed to add address");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setAddressLoading(false);
    }
  };

  // Set default address
  const handleSetDefault = async (addrId: string) => {
    try {
      setActionLoadingId(addrId);
      const res = await setUserDefaultAddress(addrId);
      if (res.success) {
        setUser((prev: any) => {
          const updated = prev.addresses.map((a: any) => ({
            ...a,
            isDefault: a.id === addrId,
          }));
          return { ...prev, addresses: updated };
        });
        toast.success("Default address updated");
      } else {
        toast.error(res.error || "Failed to set default address");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to complete request");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete address
  const handleDeleteAddress = async (addrId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      setActionLoadingId(addrId);
      const res = await deleteUserAddress(addrId);
      if (res.success) {
        setUser((prev: any) => {
          const filtered = prev.addresses.filter((a: any) => a.id !== addrId);
          // If we deleted default, set latest as default
          const hasDefault = filtered.some((a: any) => a.isDefault);
          if (filtered.length > 0 && !hasDefault) {
            filtered[0].isDefault = true;
          }
          return { ...prev, addresses: filtered };
        });
        toast.success("Address deleted successfully");
      } else {
        toast.error(res.error || "Failed to delete address");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete address");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar Navigation */}
      <div className="lg:col-span-1 space-y-2">
        <div className="bg-white dark:bg-black border border-gray-100 dark:border-white/5 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 rounded-full bg-brand/10 text-brand flex items-center justify-center font-black text-lg">
              {user.name ? user.name[0].toUpperCase() : "U"}
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-base uppercase leading-none truncate">{user.name || "Customer"}</h3>
              <p className="text-xs text-muted-foreground truncate mt-1">{user.email}</p>
            </div>
          </div>
          <Separator className="my-4" />
          <nav className="space-y-1">
            <button
              onClick={() => { setActiveTab("profile"); setShowAddressForm(false); }}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-between transition-all ${
                activeTab === "profile"
                  ? "bg-brand text-black shadow-lg shadow-brand/20"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-3">
                <User className="h-4 w-4" />
                Profile Settings
              </span>
              <ChevronRight className="h-3 w-3" />
            </button>
            <button
              onClick={() => { setActiveTab("addresses"); }}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-between transition-all ${
                activeTab === "addresses"
                  ? "bg-brand text-black shadow-lg shadow-brand/20"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-3">
                <MapPin className="h-4 w-4" />
                Saved Addresses
              </span>
              <ChevronRight className="h-3 w-3" />
            </button>
            <button
              onClick={() => { setActiveTab("orders"); setShowAddressForm(false); }}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-between transition-all ${
                activeTab === "orders"
                  ? "bg-brand text-black shadow-lg shadow-brand/20"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-3">
                <Package className="h-4 w-4" />
                Order History
              </span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-3">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <Card className="border-none shadow-sm rounded-3xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                <User className="h-5 w-5 text-brand" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal info, name, and contact details.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Full Name *</label>
                    <Input
                      type="text"
                      placeholder="Your full name"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="h-12 rounded-xl focus:border-brand"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        className="h-12 pl-11 rounded-xl focus:border-brand"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Email Address (Managed via Clerk)</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        value={user.email}
                        className="h-12 pl-11 bg-muted/30 border-muted text-muted-foreground cursor-not-allowed rounded-xl"
                        disabled
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <Button
                    type="submit"
                    disabled={profileLoading}
                    className="bg-brand text-black hover:bg-brand/90 font-black uppercase text-xs tracking-widest h-12 px-8 rounded-2xl shadow-md"
                  >
                    {profileLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Addresses Tab */}
        {activeTab === "addresses" && (
          <div className="space-y-6">
            {!showAddressForm ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-brand" />
                      Saved Delivery Addresses
                    </h2>
                    <p className="text-xs text-muted-foreground font-medium mt-1">Manage where your supplements are delivered.</p>
                  </div>
                  <Button
                    onClick={handleNewAddress}
                    className="bg-brand text-black hover:bg-brand/90 font-black uppercase text-xs tracking-widest h-11 px-5 rounded-2xl flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" /> Add Address
                  </Button>
                </div>

                {user.addresses.length === 0 ? (
                  <div className="text-center py-16 bg-white dark:bg-black rounded-3xl border-2 border-dashed border-gray-100 p-8 space-y-4">
                    <div className="h-14 w-14 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-base">No saved addresses</h3>
                      <p className="text-xs text-muted-foreground max-w-xs mx-auto">Add a delivery address to complete checkout faster.</p>
                    </div>
                    <Button variant="outline" onClick={handleNewAddress} className="rounded-xl font-bold text-xs uppercase h-10 px-5">Add First Address</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.addresses.map((addr: any) => (
                      <Card
                        key={addr.id}
                        className={`relative border-2 rounded-3xl overflow-hidden transition-all ${
                          addr.isDefault ? "border-brand shadow-sm" : "border-gray-100 hover:border-gray-200"
                        }`}
                      >
                        <CardContent className="p-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm uppercase text-black">{addr.name}</h4>
                            {addr.isDefault ? (
                              <Badge className="bg-brand text-black font-black uppercase text-[8px] tracking-wider px-2 py-0.5">
                                Default
                              </Badge>
                            ) : (
                              <button
                                onClick={() => handleSetDefault(addr.id)}
                                disabled={actionLoadingId === addr.id}
                                className="text-[9px] text-muted-foreground hover:text-brand font-black uppercase tracking-widest"
                              >
                                Set Default
                              </button>
                            )}
                          </div>
                          
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <p className="font-semibold text-black">{addr.phone}</p>
                            {addr.email && <p>{addr.email}</p>}
                            <p className="line-clamp-2 mt-2">{addr.line1}</p>
                            {addr.line2 && <p className="line-clamp-1">{addr.line2}</p>}
                            <p className="font-bold text-black mt-1">
                              {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                          </div>

                          <Separator />

                          <div className="flex items-center justify-between gap-4 pt-1">
                            <Button
                              variant="ghost"
                              onClick={() => handleEditAddress(addr)}
                              className="text-xs font-bold uppercase hover:text-brand p-0 h-auto"
                            >
                              <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => handleDeleteAddress(addr.id)}
                              disabled={actionLoadingId === addr.id}
                              className="text-xs font-bold uppercase hover:text-red-500 text-red-400 p-0 h-auto"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Card className="border-none shadow-sm rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-xl font-black uppercase tracking-tight">
                    {editingAddressId ? "Edit Delivery Address" : "Add Delivery Address"}
                  </CardTitle>
                  <CardDescription>Fill in your address information for shipping supplements.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddressSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contact Name *</label>
                        <Input
                          value={addressName}
                          onChange={(e) => setAddressName(e.target.value)}
                          className="h-11 rounded-xl focus:border-brand"
                          placeholder="e.g. John Doe"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Phone Number *</label>
                        <Input
                          value={addressPhone}
                          onChange={(e) => setAddressPhone(e.target.value)}
                          className="h-11 rounded-xl focus:border-brand"
                          placeholder="+91 99999 99999"
                          required
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Address (Optional)</label>
                        <Input
                          value={addressEmail}
                          onChange={(e) => setAddressEmail(e.target.value)}
                          className="h-11 rounded-xl focus:border-brand"
                          placeholder="email@example.com"
                          type="email"
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Address Line 1 (Flat, House, Building) *</label>
                        <Input
                          value={addressLine1}
                          onChange={(e) => setAddressLine1(e.target.value)}
                          className="h-11 rounded-xl focus:border-brand"
                          placeholder="House No, Building, Street Name"
                          required
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Address Line 2 (Area, Colony, Landmark)</label>
                        <Input
                          value={addressLine2}
                          onChange={(e) => setAddressLine2(e.target.value)}
                          className="h-11 rounded-xl focus:border-brand"
                          placeholder="Colony, Landmark, Area"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">City *</label>
                        <Input
                          value={addressCity}
                          onChange={(e) => setAddressCity(e.target.value)}
                          className="h-11 rounded-xl focus:border-brand"
                          placeholder="City"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">State *</label>
                          <Input
                            value={addressState}
                            onChange={(e) => setAddressState(e.target.value)}
                            className="h-11 rounded-xl focus:border-brand"
                            placeholder="State"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pincode *</label>
                          <Input
                            value={addressPincode}
                            onChange={(e) => setAddressPincode(e.target.value)}
                            className="h-11 rounded-xl focus:border-brand"
                            placeholder="Pin Code"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <input
                        type="checkbox"
                        id="default-address"
                        checked={addressIsDefault}
                        onChange={(e) => setAddressIsDefault(e.target.checked)}
                        className="h-4 w-4 accent-brand rounded border-gray-300"
                        disabled={user.addresses.length === 0}
                      />
                      <label htmlFor="default-address" className="text-xs font-bold uppercase tracking-wider text-gray-700 cursor-pointer">
                        Set as default shipping address
                      </label>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddressForm(false)}
                        className="rounded-2xl text-xs font-black uppercase tracking-widest h-12 px-6"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={addressLoading}
                        className="bg-brand text-black hover:bg-brand/90 font-black uppercase text-xs tracking-widest h-12 px-8 rounded-2xl shadow-md"
                      >
                        {addressLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {editingAddressId ? "Update Address" : "Save Address"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <Card className="border-none shadow-sm rounded-3xl">
            <CardHeader>
              <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                <Package className="h-5 w-5 text-brand" />
                Recent Orders
              </CardTitle>
              <CardDescription>Track and view history of your supplement orders.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {user.orders.length === 0 ? (
                <div className="text-center py-16 p-8 space-y-4">
                  <div className="h-14 w-14 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto">
                    <Package className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-base">No orders placed yet</h3>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">Browse our elite collection to kickstart your fitness journey.</p>
                  </div>
                  <Link href="/products">
                    <Button className="bg-black text-white hover:bg-black/90 rounded-2xl font-black uppercase text-xs tracking-widest h-11 px-6 mt-2">
                      Shop Now
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y space-y-6">
                  {user.orders.map((order: any, idx: number) => {
                    const displayId = order.id.slice(-8).toUpperCase();
                    return (
                      <div key={order.id} className={`${idx > 0 ? "pt-6" : ""} space-y-4`}>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div>
                            <p className="font-black text-sm uppercase">Order #{displayId}</p>
                            <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                              Placed on {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={`font-black uppercase text-[10px] tracking-widest ${
                              order.status === 'DELIVERED' ? 'bg-green-500/10 text-green-500' :
                              order.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' :
                              'bg-brand/10 text-brand'
                            }`}>
                              {order.status}
                            </Badge>
                            <Link href={`/orders/${order.id}`}>
                              <Button variant="outline" size="sm" className="rounded-xl text-[10px] font-black uppercase h-8 px-3">
                                Track Order
                              </Button>
                            </Link>
                          </div>
                        </div>

                        {/* Order Items Snapshot */}
                        <div className="bg-muted/10 border border-gray-100 rounded-2xl p-4 space-y-3">
                          {order.orderItems.map((item: any, i: number) => (
                            <div key={i} className="flex items-center justify-between text-xs font-medium">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center shrink-0 border overflow-hidden">
                                  {item.product.images?.[0] ? (
                                    <img src={item.product.images[0]} alt={item.product.name} className="object-cover h-full w-full" />
                                  ) : (
                                    <Package className="h-5 w-5 text-muted-foreground/30" />
                                  )}
                                </div>
                                <span className="truncate text-black">{item.product.name}</span>
                                <span className="text-muted-foreground text-[10px] shrink-0 font-bold">x {item.quantity}</span>
                              </div>
                              <span className="font-bold text-black">₹{(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                          <Separator className="my-2" />
                          <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider">
                            <span>Total Paid</span>
                            <span className="text-brand">₹{order.totalAmount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
