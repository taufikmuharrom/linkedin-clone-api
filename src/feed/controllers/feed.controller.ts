import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FeedService } from '../services/feed.service';
import { FeedPost } from '../models/post.interface';
import { Observable } from 'rxjs';
import { DeleteResult, UpdateResult } from 'typeorm';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/models/role.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('feed')
export class FeedController {
  constructor(private feedService: FeedService) {}

  @Roles(Role.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @Post()
  create(@Body() feedPost: FeedPost, @Request() req): Observable<FeedPost> {
    console.log(req.user);
    return this.feedService.createPost(req.user, feedPost);
  }

  // @Get()
  // findAll(): Observable<FeedPost[]> {
  //   return this.feedService.findAllPosts();
  // }

  // @Get('')
  // findAll(
  //   @Query('page') page: number = 1,
  //   @Query('limit') limit: number = 10,
  // ): Observable<Pagination<FeedPost>> {
  //   limit = limit > 100 ? 100 : limit;
  //   return this.feedService.paginate({
  //     page,
  //     limit,
  //   });
  // }

  @Get()
  findInfinite(
    @Query('take') take: number = 1,
    @Query('skip') skip: number = 1,
  ): Observable<FeedPost[]> {
    take = take > 20 ? 20 : take;
    return this.feedService.findPosts(take, skip);
  }

  @Put(':id')
  update(
    @Param() id: number,
    @Body() feedPost: FeedPost,
  ): Observable<UpdateResult> {
    return this.feedService.updatePost(id, feedPost);
  }

  @Delete(':id')
  delete(@Param() id: number): Observable<DeleteResult> {
    return this.feedService.deletePost(id);
  }
}
