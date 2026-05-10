import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryRecord } from './entities/category.entity';

type CountRow = { total: number };

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryRecord> {
    const name = createCategoryDto.name.trim();
    const code = createCategoryDto.code.trim().toUpperCase();

    const existing = await this.prisma.$queryRaw<{ id: number }[]>`
      SELECT id
      FROM categories
      WHERE code = ${code}
      LIMIT 1
    `;

    if (existing.length > 0) {
      throw new ConflictException('Category code already exists');
    }

    const rows = await this.prisma.$queryRaw<CategoryRecord[]>`
      INSERT INTO categories (name, code)
      VALUES (${name}, ${code})
      RETURNING id, name, code, created_at, updated_at
    `;

    return rows[0];
  }

  async findAll(query: QueryCategoryDto): Promise<{
    data: CategoryRecord[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10, filter } = query;
    const skip = (page - 1) * limit;
    const search = filter ? `%${filter.trim()}%` : null;

    const whereClause = search
      ? Prisma.sql`WHERE name ILIKE ${search} OR code ILIKE ${search}`
      : Prisma.empty;

    const [data, totalRows] = await Promise.all([
      this.prisma.$queryRaw<CategoryRecord[]>`
        SELECT id, name, code, created_at, updated_at
        FROM categories
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${skip}
      `,
      this.prisma.$queryRaw<CountRow[]>`
        SELECT COUNT(*)::int AS total
        FROM categories
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

  async getDropdown(): Promise<{ data: Pick<CategoryRecord, 'id' | 'name' | 'code'>[] }> {
    const data = await this.prisma.$queryRaw<Pick<CategoryRecord, 'id' | 'name' | 'code'>[]>`
      SELECT id, name, code
      FROM categories
      ORDER BY name ASC
    `;

    return { data };
  }

  async findOne(id: number): Promise<CategoryRecord> {
    const rows = await this.prisma.$queryRaw<CategoryRecord[]>`
      SELECT id, name, code, created_at, updated_at
      FROM categories
      WHERE id = ${id}
      LIMIT 1
    `;

    if (!rows.length) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return rows[0];
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<CategoryRecord> {
    const existing = await this.prisma.$queryRaw<CategoryRecord[]>`
      SELECT id, name, code, created_at, updated_at
      FROM categories
      WHERE id = ${id}
      LIMIT 1
    `;

    if (!existing.length) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    const name = typeof updateCategoryDto.name === 'string' ? updateCategoryDto.name.trim() : existing[0].name;

    const rows = await this.prisma.$queryRaw<CategoryRecord[]>`
      UPDATE categories
      SET name = ${name},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, name, code, created_at, updated_at
    `;

    return rows[0];
  }

  async remove(id: number): Promise<CategoryRecord> {
    const existing = await this.findOne(id);

    const usage = await this.prisma.$queryRaw<CountRow[]>`
      SELECT COUNT(*)::int AS total
      FROM machineries
      WHERE category_code = ${existing.code}
    `;

    if ((usage[0]?.total ?? 0) > 0) {
      throw new BadRequestException('Category is in use by machineries');
    }

    const rows = await this.prisma.$queryRaw<CategoryRecord[]>`
      DELETE FROM categories
      WHERE id = ${id}
      RETURNING id, name, code, created_at, updated_at
    `;

    if (!rows.length) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return rows[0];
  }
}
