class UnfuckWorlds < ActiveRecord::Migration
  def change
    remove_column :worlds, :contents
    add_column :worlds, :grid, :string
    add_column :worlds, :pixels_per_cell, :integer
    add_column :worlds, :screen_x, :integer
    add_column :worlds, :screen_y, :integer

    create_table :users do |t|
      t.string :username, :null => false
      t.string :password_digest, :null => false
      t.string :session_token, :null => false
      t.timestamps
    end

    add_index :users, :username, :unique => true
    add_index :users, :session_token, :unique => true

  end
end
