class Api::WorldsController < ApplicationController
  def create
    @world = World.new(:contents => params[:world][:contents].to_json)
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
