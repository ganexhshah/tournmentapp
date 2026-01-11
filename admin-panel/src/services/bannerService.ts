import api from './api';

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  publicId?: string;
  actionText?: string;
  actionUrl?: string;
  isActive: boolean;
  priority: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBannerData {
  title: string;
  subtitle?: string;
  description?: string;
  actionText?: string;
  actionUrl?: string;
  priority?: number;
  startDate?: string;
  endDate?: string;
  image: File;
}

export interface UpdateBannerData {
  title?: string;
  subtitle?: string;
  description?: string;
  actionText?: string;
  actionUrl?: string;
  priority?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  image?: File;
}

class BannerService {
  private baseUrl = '/banners';

  async getAllBanners(): Promise<Banner[]> {
    const response = await api.get(`${this.baseUrl}/admin`);
    return response.data;
  }

  async getBannerById(id: string): Promise<Banner> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async createBanner(data: CreateBannerData): Promise<Banner> {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.subtitle) formData.append('subtitle', data.subtitle);
    if (data.description) formData.append('description', data.description);
    if (data.actionText) formData.append('actionText', data.actionText);
    if (data.actionUrl) formData.append('actionUrl', data.actionUrl);
    if (data.priority !== undefined) formData.append('priority', data.priority.toString());
    if (data.startDate) formData.append('startDate', data.startDate);
    if (data.endDate) formData.append('endDate', data.endDate);
    formData.append('image', data.image);

    const response = await api.post(this.baseUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateBanner(id: string, data: UpdateBannerData): Promise<Banner> {
    const formData = new FormData();
    if (data.title) formData.append('title', data.title);
    if (data.subtitle) formData.append('subtitle', data.subtitle);
    if (data.description) formData.append('description', data.description);
    if (data.actionText) formData.append('actionText', data.actionText);
    if (data.actionUrl) formData.append('actionUrl', data.actionUrl);
    if (data.priority !== undefined) formData.append('priority', data.priority.toString());
    if (data.startDate) formData.append('startDate', data.startDate);
    if (data.endDate) formData.append('endDate', data.endDate);
    if (data.isActive !== undefined) formData.append('isActive', data.isActive.toString());
    if (data.image) formData.append('image', data.image);

    const response = await api.put(`${this.baseUrl}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteBanner(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  async toggleBannerStatus(id: string): Promise<Banner> {
    const response = await api.patch(`${this.baseUrl}/${id}/toggle`);
    return response.data;
  }
}

export const bannerService = new BannerService();