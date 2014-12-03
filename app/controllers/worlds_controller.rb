class WorldsController < ApplicationController
  def show
    @world = World.find(params[:id])
  end
end
