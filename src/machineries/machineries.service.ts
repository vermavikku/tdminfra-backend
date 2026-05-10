import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMachineryDto } from './dto/create-machinery.dto';
import { UpdateMachineryDto } from './dto/update-machinery.dto';
import { QueryMachineryDto } from './dto/query-machinery.dto';
import { MachineryRecord } from './entities/machinery.entity';

type CountRow = { total: number };

@Injectable()
export class MachineriesService {
  constructor(private prisma: PrismaService) {}

  private async ensureCategoryExists(categoryCode: string) {
    const rows = await this.prisma.$queryRaw<{ code: string }[]>`
      SELECT code
      FROM categories
      WHERE code = ${categoryCode}
      LIMIT 1
    `;

    if (!rows.length) {
      throw new NotFoundException(`Category with code ${categoryCode} not found`);
    }
  }

  async create(createMachineryDto: CreateMachineryDto): Promise<MachineryRecord> {
    const categoryCode = createMachineryDto.category_code?.trim().toUpperCase();
    if (!categoryCode) {
      throw new BadRequestException('Category code is required');
    }

    await this.ensureCategoryExists(categoryCode);

    const title = createMachineryDto.title.trim();
    const description = createMachineryDto.description?.trim() || null;
    const status = (createMachineryDto.status || 'active').toLowerCase();
    const imageUrl = createMachineryDto.image_url ?? null;

    const rows = await this.prisma.$queryRaw<MachineryRecord[]>`
      INSERT INTO machineries (title, description, category_code, status, image_url)
      VALUES (${title}, ${description}, ${categoryCode}, ${status}::"MachineryStatus", ${imageUrl})
      RETURNING id, title, description, category_code, image_url, status, created_at, updated_at
    `;

    return rows[0];
  }

  async findAll(query: QueryMachineryDto): Promise<{ data: MachineryRecord[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 50, title, category_code, status } = query;
    const skip = (page - 1) * limit;
    const search = title ? `%${title}%` : null;
    const category = category_code ? category_code.trim().toUpperCase() : null;
    const normalizedStatus = status ? String(status).toLowerCase() : null;

    const conditions: Prisma.Sql[] = [];
    if (search) {
      conditions.push(Prisma.sql`title ILIKE ${search}`);
    }
    if (category) {
      conditions.push(Prisma.sql`category_code = ${category}`);
    }
    if (normalizedStatus) {
      conditions.push(Prisma.sql`status = ${normalizedStatus}::"MachineryStatus"`);
    }

    const whereClause = conditions.length ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}` : Prisma.empty;

    const [data, totalRows] = await Promise.all([
      this.prisma.$queryRaw<MachineryRecord[]>`
        SELECT id, title, description, category_code, image_url, status, created_at, updated_at
        FROM machineries
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${skip}
      `,
      this.prisma.$queryRaw<CountRow[]>`
        SELECT COUNT(*)::int AS total
        FROM machineries
        ${whereClause}
      `,
    ]);

    return {
      data,
      total: totalRows[0]?.total ?? 0,
      page,
      limit,
    };
  }

  async getDropdown(): Promise<{ data: { id: number; title: string }[] }> {
    const data = await this.prisma.$queryRaw<{ id: number; title: string }[]>`
      SELECT id, title
      FROM machineries
      WHERE status = ${'active'}::"MachineryStatus"
      ORDER BY title ASC
    `;

    return { data };
  }

  async findOne(id: number): Promise<MachineryRecord> {
    const rows = await this.prisma.$queryRaw<MachineryRecord[]>`
      SELECT id, title, description, category_code, image_url, status, created_at, updated_at
      FROM machineries
      WHERE id = ${id}
      LIMIT 1
    `;

    if (!rows.length) {
      throw new NotFoundException(`Machinery with ID ${id} not found`);
    }

    return rows[0];
  }

  async update(id: number, updateMachineryDto: UpdateMachineryDto): Promise<MachineryRecord> {
    const existing = await this.findOne(id);

    const setParts: Prisma.Sql[] = [];

    if (typeof updateMachineryDto.title === 'string') {
      setParts.push(Prisma.sql`title = ${updateMachineryDto.title.trim()}`);
    }

    if (typeof updateMachineryDto.description === 'string') {
      setParts.push(Prisma.sql`description = ${updateMachineryDto.description.trim() || null}`);
    }

    if (typeof updateMachineryDto.category_code === 'string' && updateMachineryDto.category_code.trim()) {
      const categoryCode = updateMachineryDto.category_code.trim().toUpperCase();
      await this.ensureCategoryExists(categoryCode);
      setParts.push(Prisma.sql`category_code = ${categoryCode}`);
    }

    if (typeof updateMachineryDto.status === 'string') {
      setParts.push(Prisma.sql`status = ${updateMachineryDto.status.toLowerCase()}::"MachineryStatus"`);
    }

    if (updateMachineryDto.image_url !== undefined) {
      setParts.push(Prisma.sql`image_url = ${updateMachineryDto.image_url ?? null}`);
    }

    if (!setParts.length) {
      return existing;
    }

    const rows = await this.prisma.$queryRaw<MachineryRecord[]>`
      UPDATE machineries
      SET ${Prisma.join([...setParts, Prisma.sql`updated_at = NOW()`], ', ')}
      WHERE id = ${id}
      RETURNING id, title, description, category_code, image_url, status, created_at, updated_at
    `;

    if (!rows.length) {
      throw new NotFoundException(`Machinery with ID ${id} not found`);
    }

    return rows[0];
  }

  async remove(id: number): Promise<MachineryRecord> {
    const rows = await this.prisma.$queryRaw<MachineryRecord[]>`
      DELETE FROM machineries
      WHERE id = ${id}
      RETURNING id, title, description, category_code, image_url, status, created_at, updated_at
    `;

    if (!rows.length) {
      throw new NotFoundException(`Machinery with ID ${id} not found`);
    }

    return rows[0];
  }
}
