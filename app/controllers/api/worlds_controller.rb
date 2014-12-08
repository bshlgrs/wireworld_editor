class Api::WorldsController < ApplicationController
  def create
    @world = World.create(params.require(:world).permit([
                  :name, :description, :pixels_per_cell, :screen_x, :screen_y]))

    @world.grid = params[:world][:contents].to_json

    # todo: user id
    @world.save!
    render :json => @world
  end

  def update
  end

  def index
    render :json => World.all
  end

  def show
    render :json => World.find(params[:id])
  end

  def delete
  end

end

