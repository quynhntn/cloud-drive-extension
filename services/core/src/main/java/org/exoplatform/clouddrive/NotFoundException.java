
/*
 * Copyright (C) 2003-2014 eXo Platform SAS.
 *
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 */
package org.exoplatform.clouddrive;

/**
 * Resource not found on Cloud provider side.
 * 
 * Created by The eXo Platform SAS.
 * 
 * @author <a href="mailto:pnedonosko@exoplatform.com">Peter Nedonosko</a>
 * @version $Id: NotFoundException.java 00000 Apr 8, 2014 pnedonosko $
 * 
 */
public class NotFoundException extends CloudDriveException {

  /**
   * 
   */
  private static final long serialVersionUID = -8215526671682471362L;

  /**
   * @param message
   */
  public NotFoundException(String message) {
    super(message);
  }

  /**
   * @param message
   * @param cause
   */
  public NotFoundException(String message, Throwable cause) {
    super(message, cause);
  }

}
