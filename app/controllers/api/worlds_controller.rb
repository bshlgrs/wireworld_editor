class Api::WorldsController < ApplicationController
  def create
    @world = World.create(world_params)

    @world.grid = params[:world][:grid]

    # todo: user id
    @world.save!
    render :json => @world
  end

  def update
    world = World.find(params[:id])
    world.update_attributes(world_params)
    world.grid = params[:world][:grid]

    world.save!
    render :json => {"status" => "success"}
  end

  def index
    render :json => World.all
  end

  def show
    render :json => World.find(params[:id])
  end

  def delete
  end

  def world_params
    params.require(:world).permit([
                  :name, :description, :pixels_per_cell, :screen_x, :screen_y])
  end
end

